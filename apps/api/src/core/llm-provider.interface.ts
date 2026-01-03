export interface LlmCompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stop?: string[];
}

export interface LlmProvider {
    /**
     * Unique provider identifier (e.g., 'openai', 'anthropic')
     */
    provider: string;

    /**
     * Generate completion from a prompt
     */
    generateCompletion(
        prompt: string,
        options?: LlmCompletionOptions
    ): Promise<string>;

    /**
     * Check if the provider is configured and ready
     */
    isReady(): boolean;
}


