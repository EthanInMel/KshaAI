import { Injectable, Logger } from '@nestjs/common';
import { SourceAdapter, ContentItem } from '../core';
import { XAdapter } from './adapters/x-official.adapter';
import { RssAdapter } from './adapters/rss.adapter';
import { NewsNowAdapter } from './adapters/newsnow.adapter';
import { BlueskyAdapter } from './adapters/bluesky.adapter';
import { MastodonAdapter } from './adapters/mastodon.adapter';
import { GitHubAdapter } from './adapters/github.adapter';
import { SourceType } from '@prisma/client';

@Injectable()
export class AdapterManagerService {
    private readonly logger = new Logger(AdapterManagerService.name);
    private adapters: Map<string, SourceAdapter> = new Map();

    constructor(
        private readonly xAdapter: XAdapter,
        private readonly rssAdapter: RssAdapter,
        private readonly newsNowAdapter: NewsNowAdapter,
        private readonly blueskyAdapter: BlueskyAdapter,
        private readonly mastodonAdapter: MastodonAdapter,
        private readonly githubAdapter: GitHubAdapter,
    ) {
        this.registerAdapter(xAdapter);
        this.registerAdapter(rssAdapter);
        this.registerAdapter(newsNowAdapter);
        this.registerAdapter(blueskyAdapter);
        this.registerAdapter(mastodonAdapter);
        this.registerAdapter(githubAdapter);
    }

    private registerAdapter(adapter: SourceAdapter) {
        this.adapters.set(adapter.type, adapter);
        this.logger.log(`Registered source adapter: ${adapter.type}`);
    }

    async fetchContent(
        type: SourceType,
        identifier: string,
        config: any,
        lastPolledAt?: Date,
        userId?: string
    ): Promise<ContentItem[]> {
        const adapter = this.adapters.get(type);

        if (!adapter) {
            throw new Error(`No adapter found for source type: ${type}`);
        }

        return adapter.fetchContent(identifier, config, lastPolledAt, userId);
    }

    getAvailableAdapters(): string[] {
        return Array.from(this.adapters.keys());
    }
}
