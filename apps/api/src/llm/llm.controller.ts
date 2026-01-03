import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ModelInfo {
    id: string;
    name: string;
    description?: string;
    contextLength?: number;
    maxOutputTokens?: number;
}

interface ModelsResponse {
    provider: string;
    models: ModelInfo[];
}

@Controller('llm')
export class LlmController {
    private readonly logger = new Logger(LlmController.name);

    constructor(private readonly configService: ConfigService) { }

    @Get('models')
    async getModels(@Query('provider') provider?: string): Promise<ModelsResponse | ModelsResponse[]> {
        if (provider) {
            return this.getProviderModels(provider);
        }

        // Return all available providers' models
        const providers = ['openai', 'anthropic', 'google', 'siliconflow'];
        const results: ModelsResponse[] = [];

        for (const p of providers) {
            try {
                const result = await this.getProviderModels(p);
                if (result.models.length > 0) {
                    results.push(result);
                }
            } catch (e) {
                // Provider not configured, skip
            }
        }

        return results;
    }

    private async getProviderModels(provider: string): Promise<ModelsResponse> {
        switch (provider) {
            case 'openai':
                return this.getOpenAIModels();
            case 'anthropic':
                return this.getAnthropicModels();
            case 'google':
                return this.getGoogleModels();
            case 'siliconflow':
                return this.getSiliconFlowModels();
            default:
                return { provider, models: [] };
        }
    }

    private async getOpenAIModels(): Promise<ModelsResponse> {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            return { provider: 'openai', models: [] };
        }

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                this.logger.warn(`Failed to fetch OpenAI models: ${response.status}`);
                return this.getOpenAIFallbackModels();
            }

            const data = await response.json();
            const chatModels = data.data
                .filter((m: any) =>
                    m.id.includes('gpt') ||
                    m.id.includes('o1') ||
                    m.id.includes('chatgpt')
                )
                .filter((m: any) =>
                    !m.id.includes('instruct') &&
                    !m.id.includes('vision') &&
                    !m.id.includes('audio') &&
                    !m.id.includes('realtime') &&
                    !m.id.includes('tts') &&
                    !m.id.includes('whisper') &&
                    !m.id.includes('dall-e') &&
                    !m.id.includes('embedding')
                )
                .map((m: any) => ({
                    id: m.id,
                    name: this.formatModelName(m.id),
                }))
                .sort((a: any, b: any) => {
                    // Sort by preference
                    const order = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-mini', 'o1-preview'];
                    const aIdx = order.findIndex(o => a.id.startsWith(o));
                    const bIdx = order.findIndex(o => b.id.startsWith(o));
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return a.id.localeCompare(b.id);
                });

            // Remove duplicates, prefer base model names
            const seen = new Set<string>();
            const uniqueModels = chatModels.filter((m: any) => {
                const baseId = m.id.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-\d{4}$/, '');
                if (seen.has(baseId) && m.id !== baseId) {
                    return false;
                }
                seen.add(baseId);
                return true;
            }).slice(0, 15); // Limit to top 15

            return { provider: 'openai', models: uniqueModels };
        } catch (error) {
            this.logger.error(`Error fetching OpenAI models: ${error}`);
            return this.getOpenAIFallbackModels();
        }
    }

    private getOpenAIFallbackModels(): ModelsResponse {
        return {
            provider: 'openai',
            models: [
                { id: 'gpt-5.2', name: 'GPT-5.2 (Latest)' },
                { id: 'gpt-5.1', name: 'GPT-5.1' },
                { id: 'gpt-5', name: 'GPT-5' },
                { id: 'gpt-4.1', name: 'GPT-4.1' },
                { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
                { id: 'gpt-4o', name: 'GPT-4o' },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
                { id: 'o4-mini', name: 'o4 Mini' },
                { id: 'o3', name: 'o3' },
                { id: 'o3-mini', name: 'o3 Mini' },
                { id: 'o1', name: 'o1' },
                { id: 'o1-mini', name: 'o1 Mini' },
            ],
        };
    }

    private async getAnthropicModels(): Promise<ModelsResponse> {
        const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
        if (!apiKey) {
            return { provider: 'anthropic', models: [] };
        }

        // Anthropic doesn't have a public models list API, use static list
        return {
            provider: 'anthropic',
            models: [
                { id: 'claude-opus-4.5-20251124', name: 'Claude Opus 4.5 (Latest)' },
                { id: 'claude-sonnet-4.5-20250929', name: 'Claude Sonnet 4.5' },
                { id: 'claude-haiku-4.5-20251015', name: 'Claude Haiku 4.5' },
                { id: 'claude-opus-4-20250523', name: 'Claude Opus 4' },
                { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
                { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
                { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
            ],
        };
    }

    private async getGoogleModels(): Promise<ModelsResponse> {
        const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
        if (!apiKey) {
            return { provider: 'google', models: [] };
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            );

            if (!response.ok) {
                this.logger.warn(`Failed to fetch Google models: ${response.status}`);
                return this.getGoogleFallbackModels();
            }

            const data = await response.json();
            const models = data.models
                .filter((m: any) =>
                    m.supportedGenerationMethods?.includes('generateContent') &&
                    m.name.includes('gemini')
                )
                .map((m: any) => ({
                    id: m.name.replace('models/', ''),
                    name: m.displayName || this.formatModelName(m.name.replace('models/', '')),
                    description: m.description,
                }))
                .slice(0, 10);

            return { provider: 'google', models };
        } catch (error) {
            this.logger.error(`Error fetching Google models: ${error}`);
            return this.getGoogleFallbackModels();
        }
    }

    private getGoogleFallbackModels(): ModelsResponse {
        return {
            provider: 'google',
            models: [
                { id: 'gemini-3-pro', name: 'Gemini 3 Pro (Latest)' },
                { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
                { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
                { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro' },
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
            ],
        };
    }

    private async getSiliconFlowModels(): Promise<ModelsResponse> {
        const apiKey = this.configService.get<string>('SILICONFLOW_API_KEY');
        if (!apiKey) {
            return { provider: 'siliconflow', models: [] };
        }

        try {
            const response = await fetch('https://api.siliconflow.cn/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                this.logger.warn(`Failed to fetch SiliconFlow models: ${response.status}`);
                return this.getSiliconFlowFallbackModels();
            }

            const data = await response.json();
            const chatModels = data.data
                .filter((m: any) => m.id && !m.id.includes('embedding'))
                .map((m: any) => ({
                    id: m.id,
                    name: this.formatModelName(m.id),
                }))
                .slice(0, 20);

            return { provider: 'siliconflow', models: chatModels };
        } catch (error) {
            this.logger.error(`Error fetching SiliconFlow models: ${error}`);
            return this.getSiliconFlowFallbackModels();
        }
    }

    private getSiliconFlowFallbackModels(): ModelsResponse {
        return {
            provider: 'siliconflow',
            models: [
                { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2 (Latest)' },
                { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3' },
                { id: 'deepseek-ai/DeepSeek-R1-0528', name: 'DeepSeek R1 (0528)' },
                { id: 'Qwen/Qwen3-235B-A22B', name: 'Qwen3 235B' },
                { id: 'Qwen/Qwen3-Max', name: 'Qwen3 Max' },
                { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B' },
                { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B' },
                { id: 'THUDM/GLM-4.7', name: 'GLM-4.7' },
                { id: 'THUDM/GLM-4.5', name: 'GLM-4.5' },
                { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B' },
                { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B' },
            ],
        };
    }

    private formatModelName(id: string): string {
        // Format model ID to human-readable name
        return id
            .replace(/^models\//, '')
            .replace(/-/g, ' ')
            .replace(/\//g, ' - ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/Gpt/g, 'GPT')
            .replace(/O1/g, 'o1')
            .replace(/Ai/g, 'AI');
    }

    @Get('providers')
    async getProviders(): Promise<{ provider: string; available: boolean; configured: boolean }[]> {
        const providers = [
            {
                provider: 'openai',
                available: true,
                configured: !!this.configService.get<string>('OPENAI_API_KEY')
            },
            {
                provider: 'anthropic',
                available: true,
                configured: !!this.configService.get<string>('ANTHROPIC_API_KEY')
            },
            {
                provider: 'google',
                available: true,
                configured: !!this.configService.get<string>('GOOGLE_API_KEY')
            },
            {
                provider: 'siliconflow',
                available: true,
                configured: !!this.configService.get<string>('SILICONFLOW_API_KEY')
            },
            {
                provider: 'custom',
                available: true,
                configured: true // Custom is always available
            },
        ];

        return providers;
    }
}
