import { ContentItem } from './source-adapter.interface';

export interface StreamContext {
    streamId: string;
    sourceId: string;
    promptTemplate: {
        triggerPrompt?: string;
        notificationPrompt?: string;
        [key: string]: any;
    };
}

export interface ProcessingResult {
    isTriggered: boolean;
    llmOutput?: string;
    notificationSent: boolean;
    error?: string;
}

export interface StreamEngine {
    /**
     * Process a single content item through a stream
     */
    processContent(
        content: ContentItem,
        context: StreamContext
    ): Promise<ProcessingResult>;
}


