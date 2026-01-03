import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SourceService } from '../source/source.service';
import { AdapterManagerService } from '../source/adapter-manager.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class PollingService {
    private readonly logger = new Logger(PollingService.name);

    constructor(
        private readonly sourceService: SourceService,
        private readonly adapterManager: AdapterManagerService,
        private readonly prisma: PrismaService,
        private readonly queueService: QueueService,
    ) { }

    // Run every 5 minutes
    @Cron(CronExpression.EVERY_5_MINUTES)
    async pollSources() {
        this.logger.log('Starting source polling...');

        try {
            // Get sources that need polling
            const sources = await this.sourceService.getSourcesNeedingPoll(5);

            if (sources.length === 0) {
                this.logger.log('No sources need polling');
                return;
            }

            this.logger.log(`Polling ${sources.length} sources`);

            for (const source of sources) {
                try {
                    await this.pollSource(source.id);
                } catch (error) {
                    this.logger.error(`Error polling source ${source.id}: ${error.message}`);
                }
            }

            this.logger.log('Source polling completed');
        } catch (error) {
            this.logger.error(`Error in polling cycle: ${error.message}`);
        }
    }

    async pollSource(sourceId: string) {
        const source = await this.sourceService.findOne(sourceId);

        this.logger.log(`Polling source: ${source.type}:${source.identifier}`);

        try {
            // Fetch content using adapter
            const items = await this.adapterManager.fetchContent(
                source.type,
                source.identifier,
                source.config as any,
                source.last_polled_at || undefined
            );

            this.logger.log(`Fetched ${items.length} new items for source ${source.id}`);

            // Save content and queue for processing
            for (const item of items) {
                try {
                    // Check if content already exists
                    const existing = await this.prisma.content.findUnique({
                        where: {
                            source_id_external_id: {
                                source_id: source.id,
                                external_id: item.externalId,
                            },
                        },
                    });

                    if (existing) {
                        this.logger.debug(`Content ${item.externalId} already exists, skipping`);
                        continue;
                    }

                    // Save new content
                    const content = await this.prisma.content.create({
                        data: {
                            source_id: source.id,
                            external_id: item.externalId,
                            raw_content: item.rawContent,
                            posted_at: item.postedAt,
                            metadata: item.metadata || {},
                        },
                    });

                    this.logger.log(`Saved new content: ${content.id}`);

                    // Find active streams for this source
                    const streams = await this.prisma.stream.findMany({
                        where: {
                            source_id: source.id,
                            status: 'active',
                        },
                    });

                    // Queue processing for each stream
                    for (const stream of streams) {
                        await this.queueService.addToStreamQueue({
                            streamId: stream.id,
                            contentId: content.id,
                        });
                        this.logger.log(`Queued content ${content.id} for stream ${stream.id}`);
                    }
                } catch (error) {
                    this.logger.error(`Error saving content: ${error.message}`);
                }
            }

            // Update last polled timestamp
            await this.sourceService.updateLastPolled(source.id);

        } catch (error) {
            this.logger.error(`Error polling source ${source.id}: ${error.message}`);
            throw error;
        }
    }
}
