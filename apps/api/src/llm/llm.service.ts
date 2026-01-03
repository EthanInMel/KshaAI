import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider, LlmCompletionOptions } from '../core';
import { OpenAIProvider } from './providers/openai.provider';

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);
    private providers: Map<string, LlmProvider> = new Map();

    constructor(private readonly openaiProvider: OpenAIProvider) {
        this.registerProvider(openaiProvider);
    }

    private registerProvider(provider: LlmProvider) {
        if (provider.isReady()) {
            this.providers.set(provider.provider, provider);
            this.logger.log(`Registered LLM provider: ${provider.provider}`);
        }
    }

    async generateCompletion(
        prompt: string,
        providerName = 'openai',
        options?: LlmCompletionOptions
    ): Promise<string> {
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`LLM provider ${providerName} not found or not ready`);
        }

        return provider.generateCompletion(prompt, options);
    }

    getAvailableProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}


