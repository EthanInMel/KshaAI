import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateText, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export interface LlmConfig {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseURL?: string;
}

@Injectable()
export class AiSdkService {
    private readonly logger = new Logger(AiSdkService.name);

    constructor(private readonly configService: ConfigService) { }

    /**
     * Get the appropriate model based on provider and model name
     */
    private getModel(config: LlmConfig): LanguageModel {
        const { provider, model, apiKey, baseURL } = config;

        switch (provider) {
            case 'openai': {
                const key = apiKey || this.configService.get<string>('OPENAI_API_KEY');
                if (!key) {
                    throw new Error('OpenAI API key not configured');
                }
                const openai = createOpenAI({
                    apiKey: key,
                    baseURL: baseURL || undefined,
                });
                return openai(model);
            }

            case 'anthropic': {
                const key = apiKey || this.configService.get<string>('ANTHROPIC_API_KEY');
                if (!key) {
                    throw new Error('Anthropic API key not configured');
                }
                const anthropic = createAnthropic({
                    apiKey: key,
                });
                return anthropic(model);
            }

            case 'google': {
                const key = apiKey || this.configService.get<string>('GOOGLE_API_KEY');
                if (!key) {
                    throw new Error('Google API key not configured');
                }
                const google = createGoogleGenerativeAI({
                    apiKey: key,
                });
                return google(model);
            }

            case 'siliconflow': {
                const key = apiKey || this.configService.get<string>('SILICONFLOW_API_KEY');
                if (!key) {
                    throw new Error('SiliconFlow API key not configured');
                }
                // SiliconFlow is OpenAI-compatible
                const siliconflow = createOpenAI({
                    apiKey: key,
                    baseURL: baseURL || 'https://api.siliconflow.cn/v1',
                });
                return siliconflow(model);
            }

            case 'custom': {
                if (!apiKey) {
                    throw new Error('API key required for custom provider');
                }
                if (!baseURL) {
                    throw new Error('Base URL required for custom provider');
                }
                const custom = createOpenAI({
                    apiKey,
                    baseURL,
                });
                return custom(model);
            }

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    /**
     * Generate text completion using AI SDK
     */
    async generateCompletion(
        prompt: string,
        config: LlmConfig
    ): Promise<string> {
        const { temperature = 0.7, maxTokens = 2000 } = config;

        try {
            const model = this.getModel(config);

            this.logger.debug(
                `Generating completion with ${config.provider}/${config.model}`
            );

            const { text } = await generateText({
                model,
                prompt,
                temperature,
            });

            return text;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(
                `AI SDK error (${config.provider}/${config.model}): ${errorMessage}`
            );
            throw error;
        }
    }

    /**
     * Check if a provider is available (has API key configured)
     */
    isProviderAvailable(provider: string): boolean {
        switch (provider) {
            case 'openai':
                return !!this.configService.get<string>('OPENAI_API_KEY');
            case 'anthropic':
                return !!this.configService.get<string>('ANTHROPIC_API_KEY');
            case 'google':
                return !!this.configService.get<string>('GOOGLE_API_KEY');
            case 'siliconflow':
                return !!this.configService.get<string>('SILICONFLOW_API_KEY');
            default:
                return false;
        }
    }

    /**
     * Get list of available providers
     */
    getAvailableProviders(): string[] {
        const providers = ['openai', 'anthropic', 'google', 'siliconflow'];
        return providers.filter((p) => this.isProviderAvailable(p));
    }
}
