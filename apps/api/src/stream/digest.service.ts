import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiSdkService, LlmConfig } from '../llm/ai-sdk.service';
import { NotificationService } from '../notification/notification.service';
import { Stream } from '@prisma/client';

// Simple cron parser for basic schedules
function parseSimpleCron(schedule: string): Date {
    const now = new Date();
    const parts = schedule.split(' ');

    if (parts.length !== 5) {
        // Default to next hour
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);
        return now;
    }

    const [minute, hour] = parts;
    const nextRun = new Date();

    // Set time
    nextRun.setMinutes(minute === '*' ? 0 : parseInt(minute, 10));
    nextRun.setHours(hour === '*' ? nextRun.getHours() + 1 : parseInt(hour, 10));
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);

    // If time has passed today, set for tomorrow
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
}

@Injectable()
export class DigestService {
    private readonly logger = new Logger(DigestService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiSdkService: AiSdkService,
        private readonly notificationService: NotificationService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleDigest() {
        this.logger.log('Checking for digest streams...');

        try {
            // Find all active streams with digest type
            const streams = await this.prisma.stream.findMany({
                where: { status: 'active' },
                include: { source: true },
            });

            const digestStreams = streams.filter((s) => {
                const config = s.aggregation_config as any;
                return config?.type === 'digest';
            });

            this.logger.log(`Found ${digestStreams.length} digest streams`);

            for (const stream of digestStreams) {
                await this.processStream(stream);
            }
        } catch (error: any) {
            this.logger.error(`Error in digest cron: ${error.message}`);
        }
    }

    async processStream(stream: Stream & { source: any }) {
        try {
            const config = stream.aggregation_config as any;
            const schedule = config?.schedule || '0 9 * * *';

            // Check if we should run
            let shouldRun = false;
            const now = new Date();

            if (config?.next_run) {
                const nextRun = new Date(config.next_run);
                if (now >= nextRun) {
                    shouldRun = true;
                }
            } else {
                // First time: calculate next run and skip
                const nextRun = parseSimpleCron(schedule);
                await this.updateStreamConfig(stream, { ...config, next_run: nextRun.toISOString() });
                this.logger.log(`Initialized schedule for stream ${stream.id}, next run: ${nextRun}`);
                return;
            }

            if (!shouldRun) return;

            this.logger.log(`Processing digest for stream ${stream.id}`);

            // Fetch new content since last_run
            const lastRun = config?.last_run ? new Date(config.last_run) : stream.created_at;

            const contents = await this.prisma.content.findMany({
                where: {
                    source_id: stream.source_id,
                    created_at: { gt: lastRun },
                },
                orderBy: { created_at: 'asc' },
            });

            if (contents.length === 0) {
                this.logger.debug(`No new content for stream ${stream.id}`);
                await this.updateSchedule(stream, schedule, now);
                return;
            }

            // Aggregate Content
            const aggregatedContent = contents
                .map((c, i) => {
                    const metadata = c.metadata as any;
                    const title = metadata?.title || 'No Title';
                    return `Item ${i + 1}:\nTitle: ${title}\nContent: ${c.raw_content}\nDate: ${c.posted_at}\n`;
                })
                .join('\n---\n');

            // Prepare LLM config
            const llmConfig: LlmConfig = {
                provider: (stream as any).llm_config?.provider || 'openai',
                model: (stream as any).llm_config?.model || 'gpt-4o-mini',
                temperature: (stream as any).llm_config?.temperature ?? 0.7,
            };

            const promptTemplate =
                (stream.prompt_template as any)?.template ||
                `Summarize the following items into a daily digest:\n\n{{content}}`;

            // Build full prompt
            const fullPrompt = promptTemplate.replace('{{content}}', aggregatedContent);

            // Call LLM
            const llmResponse = await this.aiSdkService.generateCompletion(
                fullPrompt,
                llmConfig
            );

            // Save Output
            const latestContent = contents[contents.length - 1];
            await this.prisma.llmOutput.create({
                data: {
                    content_id: latestContent.id,
                    stream_id: stream.id,
                    model: llmConfig.model,
                    prompt_text: fullPrompt,
                    raw_output: llmResponse,
                },
            });

            // Send Notification
            const notificationConfig = (stream as any).notification_config;
            if (notificationConfig?.enabled && notificationConfig?.recipient) {
                await this.notificationService.send(
                    notificationConfig.channel || 'telegram',
                    notificationConfig.recipient,
                    {
                        title: `[Ksha] Daily Digest: ${stream.name}`,
                        content: llmResponse,
                    }
                );
            }

            // Update schedule
            await this.updateSchedule(stream, schedule, now);
            this.logger.log(`Digest processed successfully for stream ${stream.id}`);
        } catch (error: any) {
            this.logger.error(`Failed to process digest for stream ${stream.id}: ${error.message}`);
        }
    }

    private async updateSchedule(stream: Stream, schedule: string, lastRunDate: Date) {
        const config = stream.aggregation_config as any;
        const nextRun = parseSimpleCron(schedule);

        await this.prisma.stream.update({
            where: { id: stream.id },
            data: {
                aggregation_config: {
                    ...config,
                    last_run: lastRunDate.toISOString(),
                    next_run: nextRun.toISOString(),
                },
            },
        });
    }

    private async updateStreamConfig(stream: Stream, newConfig: any) {
        await this.prisma.stream.update({
            where: { id: stream.id },
            data: {
                aggregation_config: newConfig,
            },
        });
    }
}
