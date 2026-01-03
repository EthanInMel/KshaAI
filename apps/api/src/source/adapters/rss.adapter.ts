import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

@Injectable()
export class RssAdapter implements SourceAdapter {
    private readonly logger = new Logger(RssAdapter.name);
    public readonly type = 'rss';
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            customFields: {
                item: [
                    ['media:content', 'media'],
                    ['content:encoded', 'contentEncoded'],
                ],
            },
        });
    }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        // RSS doesn't need special config
        return true;
    }

    async fetchContent(
        identifier: string, // RSS feed URL
        config: SourceConfig,
        lastPolledAt?: Date,
        organizationId?: string // Not used for RSS, but required by interface
    ): Promise<ContentItem[]> {
        try {
            this.logger.log(`Fetching RSS feed: ${identifier}`);

            const feed = await this.parser.parseURL(identifier);

            if (!feed.items || feed.items.length === 0) {
                this.logger.warn(`No items found in RSS feed: ${identifier}`);
                return [];
            }

            this.logger.log(`Fetched ${feed.items.length} items from RSS feed`);

            // Filter by lastPolledAt
            let items = feed.items;
            if (lastPolledAt) {
                items = feed.items.filter((item) => {
                    if (!item.pubDate) return true; // Include if no date
                    const itemDate = new Date(item.pubDate);
                    return itemDate > lastPolledAt;
                });
                this.logger.log(`Filtered to ${items.length} new items since ${lastPolledAt.toISOString()}`);
            }

            // Convert to ContentItem
            return items.map((item) => {
                const content = this.extractContent(item);

                return {
                    externalId: item.guid || item.link || item.title || '',
                    rawContent: content,
                    postedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    metadata: {
                        title: item.title,
                        link: item.link,
                        author: item.creator || item.author,
                        categories: item.categories,
                        feedTitle: feed.title,
                        feedLink: feed.link,
                    },
                };
            });
        } catch (error) {
            this.logger.error(`Error fetching RSS feed ${identifier}: ${error.message}`);
            return [];
        }
    }

    private extractContent(item: any): string {
        // Try different content fields in order of preference
        if (item.contentEncoded) {
            return this.stripHtml(item.contentEncoded);
        }

        if (item.content) {
            return this.stripHtml(item.content);
        }

        if (item.summary) {
            return this.stripHtml(item.summary);
        }

        if (item.description) {
            return this.stripHtml(item.description);
        }

        return item.title || '';
    }

    private stripHtml(html: string): string {
        // Simple HTML tag removal
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
}
