import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

@Injectable()
export class NewsNowAdapter implements SourceAdapter {
    private readonly logger = new Logger(NewsNowAdapter.name);
    public readonly type = 'newsnow';
    private readonly API_BASE_URL = 'https://newsnow.busiyi.world/api/s';

    constructor(private readonly httpService: HttpService) { }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        return true;
    }

    async fetchContent(
        identifier: string, // NewsNow source ID (e.g., "weibo", "zhihu", "toutiao")
        config: SourceConfig,
        lastPolledAt?: Date,
        userId?: string
    ): Promise<ContentItem[]> {
        try {
            this.logger.log(`Fetching NewsNow feed: ${identifier}`);

            const url = `${this.API_BASE_URL}?id=${identifier}&latest`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                        'Cache-Control': 'no-cache',
                    },
                    timeout: 15000,
                })
            );

            const data = response.data;
            if (!data || !data.items || !Array.isArray(data.items)) {
                this.logger.warn(`No items found in NewsNow feed: ${identifier}`);
                return [];
            }

            this.logger.log(`Fetched ${data.items.length} items from NewsNow`);

            // Convert to ContentItem format
            const contentItems: ContentItem[] = [];

            for (const item of data.items) {
                // Skip items with invalid titles
                if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
                    continue;
                }

                const title = item.title.trim();
                const externalId = item.url || item.mobileUrl ||
                    `${identifier}-${Buffer.from(title).toString('base64').substring(0, 50)}`;

                contentItems.push({
                    externalId,
                    rawContent: title,
                    postedAt: new Date(), // NewsNow doesn't provide timestamp
                    metadata: {
                        title,
                        url: item.url,
                        mobileUrl: item.mobileUrl,
                        extra: item.extra,
                    },
                });
            }

            this.logger.log(`Processed ${contentItems.length} valid items`);
            return contentItems;
        } catch (error) {
            this.logger.error(`Error fetching NewsNow feed ${identifier}: ${error.message}`);
            return [];
        }
    }
}
