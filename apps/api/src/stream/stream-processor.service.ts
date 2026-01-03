import { Injectable, Logger } from '@nestjs/common';
import { Stream, Content } from '@prisma/client';
import { AiSdkService, LlmConfig } from '../llm/ai-sdk.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class StreamProcessorService {
    private readonly logger = new Logger(StreamProcessorService.name);

    constructor(
        private readonly aiSdkService: AiSdkService,
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    /**
     * Get LLM config from stream, with defaults
     */
    private getLlmConfig(stream: Stream): LlmConfig {
        const llmConfig = (stream as any).llm_config || {};
        return {
            provider: llmConfig.provider || 'openai',
            model: llmConfig.model || 'gpt-4o-mini',
            temperature: llmConfig.temperature ?? 0.7,
            apiKey: llmConfig.apiKey,
            baseURL: llmConfig.baseURL,
        };
    }

    async process(streamId: string, contentId: string): Promise<void> {
        this.logger.log(`Processing content ${contentId} for stream ${streamId}`);

        // 1. Fetch Stream and Content
        const stream = await this.prisma.stream.findUnique({
            where: { id: streamId },
            include: { source: true, user: true },
        });

        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
        });

        if (!stream || !content) {
            this.logger.error(`Stream ${streamId} or Content ${contentId} not found`);
            return;
        }

        try {
            // 2. Prepare Context
            const promptTemplate = stream.prompt_template as any;
            const triggerPrompt = promptTemplate?.triggerPrompt || promptTemplate?.template;
            const llmConfig = this.getLlmConfig(stream);

            // Check if LLM should be skipped (empty prompt)
            const skipLlm = !triggerPrompt || triggerPrompt.trim() === '';

            // 3. LLM Analysis (Trigger Check)
            let isTriggered = true;
            let analysisResult = '';

            if (!skipLlm && triggerPrompt) {
                const fullPrompt = this.replaceVariables(triggerPrompt, content, stream);
                const response = await this.aiSdkService.generateCompletion(fullPrompt, llmConfig);

                // Simple logic: if response starts with "YES" or contains specific keywords
                // For now, let's assume the prompt asks to return "TRUE" or "FALSE"
                isTriggered = response.toLowerCase().includes('true') || response.toLowerCase().includes('yes');
                analysisResult = response;

                await this.log(stream.id, 'info', `LLM Trigger Check (${llmConfig.provider}/${llmConfig.model}): ${isTriggered}`, { response, contentId });
            }

            if (!isTriggered) {
                this.logger.log(`Stream ${stream.id} skipped content ${content.id} (Not triggered)`);
                return;
            }

            // 4. Generate Notification Content
            const notificationPrompt = promptTemplate?.notificationPrompt;
            let notificationMessage = content.raw_content; // Default to raw content

            if (!skipLlm && notificationPrompt) {
                const fullPrompt = this.replaceVariables(notificationPrompt, content, stream);
                notificationMessage = await this.aiSdkService.generateCompletion(fullPrompt, llmConfig);
            }

            // 5. Send Notification
            const notificationConfig = stream.notification_config as any;
            const channelName = notificationConfig?.channel || 'telegram';
            const recipient = notificationConfig?.recipient || '';

            // Per-user config overrides
            const userSettings = (stream.user?.settings as any)?.notifications || {};

            // Extract URL from metadata if available
            const metadata = content.metadata as any;
            const contentUrl = metadata?.url || metadata?.link || null;

            // Attempt to send notification
            const sent = await this.notificationService.send(channelName, recipient, {
                title: `New Update from ${stream.name}`,
                content: notificationMessage,
                url: contentUrl,
                metadata: {
                    streamId: stream.id,
                    sourceId: stream.source_id,
                }
            }, userSettings);

            if (sent) {
                await this.log(stream.id, 'success', `Notification sent to ${channelName}`, { recipient, contentId });
            } else {
                // Only log error if we expected to send (e.g. recipient provided or global config exists)
                // For now, simple logging
                await this.log(stream.id, 'error', `Failed to send notification to ${channelName}`, { recipient, contentId });
            }

        } catch (error) {
            this.logger.error(`Error processing stream ${stream.id}: ${error.message}`, error.stack);
            await this.log(stream.id, 'error', `Processing error: ${error.message}`, { contentId });
        }
    }

    private replaceVariables(template: string, content: Content, stream: Stream): string {
        let result = template;
        const metadata = content.metadata as any;
        result = result.replace(/{{content}}/g, content.raw_content || '');
        result = result.replace(/{{title}}/g, metadata?.title || '');
        result = result.replace(/{{url}}/g, metadata?.url || metadata?.link || '');
        result = result.replace(/{{source}}/g, stream.name || '');
        return result;
    }

    private async log(streamId: string, type: string, message: string, metadata?: any) {
        const log = await this.prisma.log.create({
            data: {
                stream_id: streamId,
                type,
                message,
                metadata: metadata || {},
            },
        });

        // Emit real-time log event
        this.eventsGateway.emitLog(log);
    }

    /**
     * Process content for backtest - returns result without sending notifications
     */
    async processContentForBacktest(
        content: Content,
        stream: Stream,
        backtestId: string
    ): Promise<{ triggered: boolean; analysisResult: string; notificationMessage: string }> {
        this.logger.debug(`Backtest processing content ${content.id} for stream ${stream.id}`);

        const promptTemplate = stream.prompt_template as any;
        const triggerPrompt = promptTemplate?.triggerPrompt || promptTemplate?.template;
        const llmConfig = this.getLlmConfig(stream);
        const skipLlm = !triggerPrompt || triggerPrompt.trim() === '';

        let isTriggered = true;
        let analysisResult = '';

        // Trigger check
        if (!skipLlm && triggerPrompt) {
            const fullPrompt = this.replaceVariables(triggerPrompt, content, stream);
            const response = await this.aiSdkService.generateCompletion(fullPrompt, llmConfig);
            isTriggered = response.toLowerCase().includes('true') || response.toLowerCase().includes('yes');
            analysisResult = response;
        }

        // Generate notification content
        let notificationMessage = content.raw_content;
        const notificationPrompt = promptTemplate?.notificationPrompt;

        if (isTriggered && !skipLlm && notificationPrompt) {
            const fullPrompt = this.replaceVariables(notificationPrompt, content, stream);
            notificationMessage = await this.aiSdkService.generateCompletion(fullPrompt, llmConfig);
        }

        // Save LLM output with backtest_id
        if (analysisResult || (isTriggered && notificationMessage !== content.raw_content)) {
            await this.prisma.llmOutput.create({
                data: {
                    content_id: content.id,
                    stream_id: stream.id,
                    raw_output: isTriggered ? notificationMessage : analysisResult,
                    prompt_text: triggerPrompt || notificationPrompt,
                    backtest_id: backtestId,
                },
            });
        }

        return {
            triggered: isTriggered,
            analysisResult,
            notificationMessage: isTriggered ? notificationMessage : '',
        };
    }
}
