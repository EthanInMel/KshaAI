import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

interface TwitterCredentials {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
    bearerToken?: string;
}

/**
 * Official Twitter API v2 adapter
 * Requires Twitter Developer API credentials
 */
@Injectable()
export class XAdapter implements SourceAdapter {
    private readonly logger = new Logger(XAdapter.name);
    public readonly type = 'x';
    private twitterClient: TwitterApiReadOnly | null = null;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.initializeClient();
    }

    /**
     * Initialize Twitter client with credentials from environment
     */
    private initializeClient() {
        const bearerToken = this.configService.get<string>('TWITTER_BEARER_TOKEN');
        const apiKey = this.configService.get<string>('TWITTER_API_KEY');
        const apiSecret = this.configService.get<string>('TWITTER_API_SECRET');
        const accessToken = this.configService.get<string>('TWITTER_ACCESS_TOKEN');
        const accessSecret = this.configService.get<string>('TWITTER_ACCESS_SECRET');

        try {
            if (bearerToken) {
                // Use Bearer Token (App-only auth) - Recommended
                this.twitterClient = new TwitterApi(bearerToken).readOnly;
                this.logger.log('Twitter client initialized with Bearer Token');
            } else if (apiKey && apiSecret && accessToken && accessSecret) {
                // Use OAuth 1.0a (User context)
                const userClient = new TwitterApi({
                    appKey: apiKey,
                    appSecret: apiSecret,
                    accessToken: accessToken,
                    accessSecret: accessSecret,
                });
                this.twitterClient = userClient.readOnly;
                this.logger.log('Twitter client initialized with OAuth 1.0a');
            } else {
                this.logger.warn('Twitter API credentials not configured. Set TWITTER_BEARER_TOKEN or OAuth credentials in environment.');
            }
        } catch (error) {
            this.logger.error(`Failed to initialize Twitter client: ${error.message}`);
        }
    }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        return !!this.twitterClient;
    }

    async fetchContent(
        identifier: string,
        config: SourceConfig,
        lastPolledAt?: Date
    ): Promise<ContentItem[]> {
        if (!this.twitterClient) {
            this.logger.error('Twitter client not initialized. Check API credentials.');
            return [];
        }

        try {
            const username = identifier.startsWith('@') ? identifier.substring(1) : identifier;
            const fetchType = (config as any)?.type || 'user_timeline';
            const maxResults = Math.min((config as any)?.maxResults || 10, 100);

            let tweets: any[] = [];

            switch (fetchType) {
                case 'user_timeline':
                    tweets = await this.fetchUserTimeline(username, maxResults);
                    break;
                case 'user_mentions':
                    tweets = await this.fetchUserMentions(username, maxResults);
                    break;
                case 'search':
                    tweets = await this.fetchSearch(identifier, maxResults);
                    break;
                case 'hashtag': {
                    const hashtag = identifier.startsWith('#') ? identifier : `#${identifier}`;
                    tweets = await this.fetchSearch(hashtag, maxResults);
                    break;
                }
                default:
                    tweets = await this.fetchUserTimeline(username, maxResults);
            }

            this.logger.log(`Fetched ${tweets.length} tweets for ${identifier} (${fetchType})`);

            // Filter by lastPolledAt
            let filteredTweets = tweets;
            if (lastPolledAt && tweets.length > 0) {
                filteredTweets = tweets.filter((tweet) => {
                    const tweetDate = new Date(tweet.created_at);
                    return tweetDate > lastPolledAt;
                });
                this.logger.log(`Filtered to ${filteredTweets.length} new tweets since ${lastPolledAt.toISOString()}`);
            }

            // Convert to ContentItem
            return filteredTweets.map((tweet) => ({
                externalId: tweet.id,
                rawContent: tweet.text,
                postedAt: new Date(tweet.created_at),
                metadata: {
                    tweet_id: tweet.id,
                    author_id: tweet.author_id,
                    created_at: tweet.created_at,
                    public_metrics: tweet.public_metrics,
                    entities: tweet.entities,
                    full_tweet: tweet,
                    source_type: 'official_api_v2',
                },
            }));
        } catch (error) {
            this.logger.error(`Error fetching tweets for ${identifier}: ${error.message}`);
            if ((error as any).code === 429) {
                this.logger.warn(`Rate limit exceeded for ${identifier}`);
            }
            return [];
        }
    }

    /**
     * Fetch user timeline
     */
    private async fetchUserTimeline(username: string, maxResults = 10): Promise<any[]> {
        try {
            const user = await this.twitterClient!.v2.userByUsername(username);
            if (!user.data) {
                this.logger.warn(`User not found: ${username}`);
                return [];
            }

            const timeline = await this.twitterClient!.v2.userTimeline(user.data.id, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
            });

            return timeline.data.data || [];
        } catch (error) {
            this.logger.error(`Failed to fetch user timeline for ${username}: ${error.message}`);
            return [];
        }
    }

    /**
     * Fetch user mentions
     */
    private async fetchUserMentions(username: string, maxResults = 10): Promise<any[]> {
        try {
            const user = await this.twitterClient!.v2.userByUsername(username);
            if (!user.data) return [];

            const mentions = await this.twitterClient!.v2.userMentionTimeline(user.data.id, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
            });

            return mentions.data.data || [];
        } catch (error) {
            this.logger.error(`Failed to fetch mentions for ${username}: ${error.message}`);
            return [];
        }
    }

    /**
     * Fetch tweets by search query
     */
    private async fetchSearch(query: string, maxResults = 10): Promise<any[]> {
        try {
            const search = await this.twitterClient!.v2.search(query, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
            });

            return search.data.data || [];
        } catch (error) {
            this.logger.error(`Failed to search for "${query}": ${error.message}`);
            return [];
        }
    }
}


