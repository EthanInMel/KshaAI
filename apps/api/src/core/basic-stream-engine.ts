import { StreamEngine, StreamContext, ProcessingResult } from './stream-engine.interface';
import { ContentItem } from './source-adapter.interface';

export class BasicStreamEngine implements StreamEngine {
    async processContent(
        content: ContentItem,
        context: StreamContext
    ): Promise<ProcessingResult> {
        // 1. Check if content matches trigger criteria (Basic implementation)
        // In a real implementation, this would call an LLM

        const triggerPrompt = context.promptTemplate.triggerPrompt || '';
        const isTriggered = this.evaluateTrigger(content.rawContent, triggerPrompt);

        if (!isTriggered) {
            return {
                isTriggered: false,
                notificationSent: false,
            };
        }

        // 2. Generate notification content (Basic implementation)
        const notificationPrompt = context.promptTemplate.notificationPrompt || '';
        const llmOutput = `Processed: ${content.rawContent.substring(0, 50)}...`;

        // 3. Send notification (Mock)
        // In a real implementation, this would call NotificationService

        return {
            isTriggered: true,
            llmOutput,
            notificationSent: true,
        };
    }

    private evaluateTrigger(content: string, prompt: string): boolean {
        // Simple keyword matching for now
        if (!prompt) return true; // If no prompt, always trigger

        const keywords = prompt.split(' ').filter(k => k.length > 0);
        return keywords.some(k => content.toLowerCase().includes(k.toLowerCase()));
    }
}


