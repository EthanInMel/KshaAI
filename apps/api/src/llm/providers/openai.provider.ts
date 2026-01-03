import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmProvider, LlmCompletionOptions } from '../../core';

@Injectable()
export class OpenAIProvider implements LlmProvider {
    private readonly logger = new Logger(OpenAIProvider.name);
    private openai: OpenAI | null = null;
    public readonly provider = 'openai';

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OPENAI_API_KEY not set');
        }
    }

    isReady(): boolean {
        return !!this.openai;
    }

    async generateCompletion(
        prompt: string,
        options?: LlmCompletionOptions
    ): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI not configured');
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: options?.model || 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 1000,
                stop: options?.stop,
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            this.logger.error(`OpenAI API error: ${(error as Error).message}`);
            throw error;
        }
    }
}


