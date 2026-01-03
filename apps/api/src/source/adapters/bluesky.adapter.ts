import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

interface BlueskyPost {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName?: string;
    };
    record: {
        text: string;
        createdAt: string;
        embed?: any;
        reply?: any;
    };
    replyCount: number;
    repostCount: number;
    likeCount: number;
}

@Injectable()
export class BlueskyAdapter implements SourceAdapter {
    private readonly logger = new Logger(BlueskyAdapter.name);
    public readonly type = 'bluesky';
    private readonly API_BASE = 'https://public.api.bsky.app/xrpc';

    constructor(private readonly httpService: HttpService) { }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        return true;
    }

    async fetchContent(
        identifier: string, // Bluesky handle (e.g., "alice.bsky.social")
        config: SourceConfig,
        lastPolledAt?: Date,
        userId?: string
    ): Promise<ContentItem[]> {
        try {
            this.logger.log(`Fetching Bluesky feed for: ${identifier}`);

            // Get author feed
            const response = await firstValueFrom(
                this.httpService.get(`${this.API_BASE}/app.bsky.feed.getAuthorFeed`, {
                    params: { actor: identifier, limit: 50 },
                    headers: {
                        'User-Agent': 'ksha/1.0',
                        'Accept': 'application/json',
                    },
                    timeout: 15000,
                })
            );

            const data = response.data;
            if (!data?.feed || !Array.isArray(data.feed)) {
                this.logger.warn(`No feed found for Bluesky user: ${identifier}`);
                return [];
            }

            this.logger.log(`Fetched ${data.feed.length} posts from Bluesky`);

            const items: ContentItem[] = [];

            for (const item of data.feed) {
                const post: BlueskyPost = item.post;
                if (!post?.record?.text) continue;

                // Filter by lastPolledAt
                const postedAt = new Date(post.record.createdAt);
                if (lastPolledAt && postedAt <= lastPolledAt) continue;

                const postId = post.uri.split('/').pop();
                const externalId = `${post.author.handle}_${postId}`;

                let contentText = post.record.text;

                // Handle embeds
                if (post.record.embed?.external) {
                    contentText += `\n\nLink: ${post.record.embed.external.uri}`;
                }
                if (post.record.embed?.images) {
                    contentText += `\n\n[${post.record.embed.images.length} image(s)]`;
                }

                // Mark replies
                if (post.record.reply) {
                    contentText = `[Reply]\n${contentText}`;
                }

                items.push({
                    externalId,
                    rawContent: contentText,
                    postedAt,
                    metadata: {
                        uri: post.uri,
                        cid: post.cid,
                        author: {
                            did: post.author.did,
                            handle: post.author.handle,
                            displayName: post.author.displayName,
                        },
                        replyCount: post.replyCount,
                        repostCount: post.repostCount,
                        likeCount: post.likeCount,
                        hasEmbed: !!post.record.embed,
                        isReply: !!post.record.reply,
                    },
                });
            }

            this.logger.log(`Processed ${items.length} new Bluesky posts`);
            return items;
        } catch (error) {
            this.logger.error(`Error fetching Bluesky feed ${identifier}: ${error.message}`);
            return [];
        }
    }

    // Helper: Get profile
    async getProfile(actor: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.API_BASE}/app.bsky.actor.getProfile`, {
                    params: { actor },
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get Bluesky profile: ${error.message}`);
            return null;
        }
    }

    // Helper: Search posts
    async searchPosts(query: string, limit = 25): Promise<BlueskyPost[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.API_BASE}/app.bsky.feed.searchPosts`, {
                    params: { q: query, limit },
                })
            );
            return response.data.posts || [];
        } catch (error) {
            this.logger.error(`Failed to search Bluesky posts: ${error.message}`);
            return [];
        }
    }
}
