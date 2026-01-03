import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    author: string;
    subreddit: string;
    created_utc: number;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    is_self: boolean;
    link_flair_text?: string;
}

export interface RedditSourceConfig {
    subreddits: string[];
    sort?: 'hot' | 'new' | 'top' | 'rising';
    limit?: number;
    lastPostIds?: Record<string, string>;
}

export interface SubredditInfo {
    name: string;
    title: string;
    description: string;
    subscribers: number;
    public_description: string;
    icon_img?: string;
}

@Injectable()
export class RedditAdapter {
    private readonly logger = new Logger(RedditAdapter.name);
    private readonly REDDIT_API_BASE = 'https://www.reddit.com';
    private readonly USER_AGENT = 'ksha-core/1.0';

    constructor(private readonly httpService: HttpService) { }

    private getHeaders() {
        return {
            'User-Agent': this.USER_AGENT,
        };
    }

    /**
     * Validate subreddit exists
     */
    async validateSubreddit(subreddit: string): Promise<SubredditInfo | null> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.REDDIT_API_BASE}/r/${subreddit}/about.json`, {
                    headers: this.getHeaders(),
                })
            );

            const data = response.data.data;
            return {
                name: data.display_name,
                title: data.title,
                description: data.description,
                subscribers: data.subscribers,
                public_description: data.public_description,
                icon_img: data.icon_img,
            };
        } catch (error: any) {
            this.logger.error(`Failed to validate subreddit ${subreddit}: ${error.message}`);
            return null;
        }
    }

    /**
     * Get posts from a subreddit
     */
    async getSubredditPosts(
        subreddit: string,
        sort = 'new',
        limit = 25,
        after?: string
    ): Promise<RedditPost[]> {
        try {
            const params: any = { limit, raw_json: 1 };
            if (after) params.after = `t3_${after}`;

            const response = await firstValueFrom(
                this.httpService.get(`${this.REDDIT_API_BASE}/r/${subreddit}/${sort}.json`, {
                    headers: this.getHeaders(),
                    params,
                })
            );

            return response.data.data.children.map((child: any) => child.data as RedditPost);
        } catch (error: any) {
            this.logger.error(`Failed to get posts from r/${subreddit}: ${error.message}`);
            return [];
        }
    }

    /**
     * Search for subreddits
     */
    async searchSubreddits(query: string): Promise<SubredditInfo[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.REDDIT_API_BASE}/subreddits/search.json`, {
                    headers: this.getHeaders(),
                    params: { q: query, limit: 10 },
                })
            );

            return response.data.data.children.map((child: any) => ({
                name: child.data.display_name,
                title: child.data.title,
                description: child.data.description,
                subscribers: child.data.subscribers,
                public_description: child.data.public_description,
                icon_img: child.data.icon_img,
            }));
        } catch (error: any) {
            this.logger.error(`Failed to search subreddits: ${error.message}`);
            return [];
        }
    }

    /**
     * Parse Reddit post into standardized format
     */
    parsePost(post: RedditPost): {
        externalId: string;
        content: string;
        postedAt: Date;
        metadata: any;
    } {
        let contentText = post.title;
        if (post.selftext) {
            contentText += `\n\n${post.selftext}`;
        }
        if (!post.is_self && post.url) {
            contentText += `\n\nLink: ${post.url}`;
        }

        return {
            externalId: post.id,
            content: contentText,
            postedAt: new Date(post.created_utc * 1000),
            metadata: {
                post_id: post.id,
                subreddit: post.subreddit,
                author: post.author,
                score: post.score,
                num_comments: post.num_comments,
                url: post.url,
                permalink: `https://reddit.com${post.permalink}`,
                flair: post.link_flair_text,
                is_self: post.is_self,
            },
        };
    }

    /**
     * Test subreddits validation
     */
    async testSubreddits(subreddits: string[]): Promise<{
        valid: SubredditInfo[];
        invalid: string[];
    }> {
        const valid: SubredditInfo[] = [];
        const invalid: string[] = [];

        for (const sub of subreddits) {
            const info = await this.validateSubreddit(sub);
            if (info) {
                valid.push(info);
            } else {
                invalid.push(sub);
            }
        }

        return { valid, invalid };
    }
}
