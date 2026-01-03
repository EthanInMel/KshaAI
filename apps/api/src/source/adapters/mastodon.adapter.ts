import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

interface MastodonStatus {
    id: string;
    created_at: string;
    content: string;
    account: {
        id: string;
        username: string;
        acct: string;
        display_name: string;
    };
    url: string;
    reblogs_count: number;
    favourites_count: number;
    replies_count: number;
    sensitive: boolean;
    spoiler_text: string;
    media_attachments?: any[];
    reblog?: MastodonStatus;
}

@Injectable()
export class MastodonAdapter implements SourceAdapter {
    private readonly logger = new Logger(MastodonAdapter.name);
    public readonly type = 'mastodon';

    constructor(private readonly httpService: HttpService) { }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        return true;
    }

    async fetchContent(
        identifier: string, // Format: "instance:accountId" or "instance:@username"
        config: SourceConfig,
        lastPolledAt?: Date,
        userId?: string
    ): Promise<ContentItem[]> {
        try {
            const [instance, accountId] = identifier.split(':');
            if (!instance || !accountId) {
                this.logger.error(`Invalid Mastodon identifier format: ${identifier}`);
                return [];
            }

            this.logger.log(`Fetching Mastodon statuses from ${instance} for ${accountId}`);

            // Resolve username to account ID if needed
            let resolvedAccountId = accountId;
            if (accountId.startsWith('@')) {
                const username = accountId.substring(1);
                const account = await this.lookupAccount(instance, username);
                if (!account) {
                    this.logger.error(`Account not found: ${username}@${instance}`);
                    return [];
                }
                resolvedAccountId = account.id;
            }

            // Get account statuses
            const statuses = await this.getAccountStatuses(instance, resolvedAccountId);

            const items: ContentItem[] = [];

            for (const status of statuses) {
                const postedAt = new Date(status.created_at);
                if (lastPolledAt && postedAt <= lastPolledAt) continue;

                // Handle reblogs (boosts)
                const actualStatus = status.reblog || status;
                let contentText = this.stripHtml(actualStatus.content);

                if (status.reblog) {
                    contentText = `[Boosted from @${actualStatus.account.acct}]\n\n${contentText}`;
                }

                if (actualStatus.spoiler_text) {
                    contentText = `[CW: ${actualStatus.spoiler_text}]\n\n${contentText}`;
                }

                items.push({
                    externalId: status.id,
                    rawContent: contentText || '[Media only]',
                    postedAt,
                    metadata: {
                        statusId: status.id,
                        account: {
                            id: status.account.id,
                            username: status.account.username,
                            acct: status.account.acct,
                            displayName: status.account.display_name,
                        },
                        url: status.url,
                        reblogsCount: status.reblogs_count,
                        favouritesCount: status.favourites_count,
                        isReblog: !!status.reblog,
                        hasMedia: !!actualStatus.media_attachments?.length,
                        instance,
                    },
                });
            }

            this.logger.log(`Processed ${items.length} new Mastodon statuses`);
            return items;
        } catch (error) {
            this.logger.error(`Error fetching Mastodon statuses ${identifier}: ${error.message}`);
            return [];
        }
    }

    private stripHtml(html: string): string {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }

    async lookupAccount(instance: string, username: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`https://${instance}/api/v1/accounts/lookup`, {
                    params: { acct: username },
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to lookup account ${username}@${instance}: ${error.message}`);
            return null;
        }
    }

    async getAccountStatuses(instance: string, accountId: string, limit = 40): Promise<MastodonStatus[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`https://${instance}/api/v1/accounts/${accountId}/statuses`, {
                    params: { limit, exclude_replies: false },
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get account statuses: ${error.message}`);
            return [];
        }
    }

    async verifyInstance(instance: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`https://${instance}/api/v1/instance`)
            );
            return {
                name: response.data.title,
                description: response.data.short_description || response.data.description,
                version: response.data.version,
            };
        } catch (error) {
            this.logger.error(`Failed to verify instance ${instance}: ${error.message}`);
            return null;
        }
    }
}
