'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LlmConfig, testStreamLlm } from '../../lib/api';
import { ChevronDown, ChevronUp, TestTube, X, Sparkles, Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n-context';

interface LlmConfigFormProps {
    config: LlmConfig;
    promptTemplate: { template: string };
    mode?: 'realtime' | 'digest';
    onChange: (config: LlmConfig, promptTemplate: { template: string }) => void;
}

const PROVIDERS = [
    { value: 'openai', label: 'OpenAI', color: 'from-green-500 to-green-600' },
    { value: 'anthropic', label: 'Anthropic', color: 'from-orange-500 to-red-500' },
    { value: 'google', label: 'Google Gemini', color: 'from-blue-500 to-purple-500' },
    { value: 'siliconflow', label: 'SiliconFlow', color: 'from-cyan-500 to-blue-500' },
    { value: 'custom', label: 'Custom (OpenAI Compatible)', color: 'from-gray-500 to-gray-600' },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
    openai: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
    ],
    anthropic: [
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    ],
    google: [
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
    ],
    siliconflow: [
        { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
        { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B' },
        { value: 'deepseek-ai/DeepSeek-V2.5', label: 'DeepSeek V2.5' },
        { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B' },
        { value: 'meta-llama/Meta-Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B' },
    ],
    custom: [],
};



export default function LlmConfigForm({ config, promptTemplate, mode = 'realtime', onChange }: LlmConfigFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testContent, setTestContent] = useState('This is a sample content to test the LLM configuration. Ksha Cloud is an amazing platform for building AI-powered data streams.');
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);
    const { t } = useI18n();

    const PRESET_TEMPLATES = [
        { name: t("streams.preset_summarize"), icon: '📝', template: 'Summarize the following content in 3 bullet points:\n\n{{content}}' },
        { name: t("streams.preset_sentiment"), icon: '😊', template: 'Analyze the sentiment of the following content. Respond with POSITIVE, NEGATIVE, or NEUTRAL, followed by a brief explanation:\n\n{{content}}' },
        { name: t("streams.preset_extract"), icon: '🏷️', template: 'Extract all named entities (people, organizations, locations) from the following content and format them as JSON:\n\n{{content}}' },
        { name: t("streams.preset_translate"), icon: '🇨🇳', template: 'Translate the following content into Simplified Chinese:\n\n{{content}}' },
        { name: t("streams.preset_insights"), icon: '💡', template: 'Identify the key insights and actionable takeaways from the following content:\n\n{{content}}' },
    ];

    const handleConfigChange = (key: keyof LlmConfig, value: any) => {
        const newConfig = { ...config, [key]: value };
        if (key === 'provider') {
            newConfig.model = MODELS[value as string]?.[0]?.value || '';
        }
        onChange(newConfig, promptTemplate);
    };

    const handleTemplateChange = (template: string) => {
        onChange(config, { ...promptTemplate, template });
    };

    const applyPreset = (presetTemplate: string) => {
        handleTemplateChange(presetTemplate);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await testStreamLlm({
                llm_config: config,
                prompt_template: promptTemplate,
                sample_content: testContent,
            });
            setTestResult(result);
        } catch (error: any) {
            setTestResult({ error: error.message });
        } finally {
            setTesting(false);
        }
    };

    const selectedProvider = PROVIDERS.find(p => p.value === config.provider);

    return (
        <div className="space-y-6">
            {/* Provider Selection */}
            <div>
                <label className="block text-sm font-medium mb-3">{t("streams.provider")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PROVIDERS.map((provider) => (
                        <motion.button
                            key={provider.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleConfigChange('provider', provider.value)}
                            className={`relative p-4 rounded-lg border-2 transition text-left ${config.provider === provider.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <div className={`absolute top-2 right-2 w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} opacity-20`}></div>
                            <div className="font-semibold">{provider.label}</div>
                            {config.provider === provider.value && (
                                <motion.div
                                    layoutId="selectedProvider"
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                >
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Model and Temperature */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">{t("streams.model")}</label>
                    {config.provider === 'custom' ? (
                        <input
                            type="text"
                            value={config.model}
                            onChange={(e) => handleConfigChange('model', e.target.value)}
                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            placeholder="e.g., gpt-3.5-turbo"
                        />
                    ) : (
                        <select
                            value={config.model}
                            onChange={(e) => handleConfigChange('model', e.target.value)}
                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        >
                            {MODELS[config.provider]?.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t("streams.temperature")}: {config.temperature?.toFixed(1) ?? '0.7'}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature ?? 0.7}
                        onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer mt-3"
                        style={{
                            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 50%, rgb(239, 68, 68) 100%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-foreground/50 mt-2">
                        <span>{t("streams.temp_precise")}</span>
                        <span>{t("streams.temp_balanced")}</span>
                        <span>{t("streams.temp_creative")}</span>
                    </div>
                </div>
            </div>

            {/* Advanced Settings */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showAdvanced ? t("streams.hide") : t("streams.show")} {t("streams.advanced_settings")}
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2">{t("streams.api_key_optional")}</label>
                                <input
                                    type="password"
                                    value={config.api_key || ''}
                                    onChange={(e) => handleConfigChange('api_key', e.target.value)}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:border-primary outline-none transition"
                                    placeholder={t("streams.override_api_key")}
                                />
                            </div>
                            {(config.provider === 'custom' || config.provider === 'siliconflow') && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t("streams.base_url_label")}</label>
                                    <input
                                        type="text"
                                        value={config.base_url || ''}
                                        onChange={(e) => handleConfigChange('base_url', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:border-primary outline-none transition"
                                        placeholder="https://api.example.com/v1"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Prompt Template */}
            <div className="border-t border-border pt-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {mode === 'digest' ? t("streams.digest_prompt_template") : t("streams.prompt_template")}
                        </h3>
                        <p className="text-sm text-foreground/60 mt-1">
                            {t("streams.prompt_template_desc")}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowTestModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
                    >
                        <TestTube className="w-4 h-4" />
                        {t("streams.test_prompt")}
                    </motion.button>
                </div>

                {/* Preset Templates */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-foreground/60 self-center">{t("streams.quick_presets")}</span>
                    {PRESET_TEMPLATES.map((preset) => (
                        <motion.button
                            key={preset.name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => applyPreset(preset.template)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition"
                        >
                            <span>{preset.icon}</span>
                            {preset.name}
                        </motion.button>
                    ))}
                </div>

                <textarea
                    rows={8}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-mono text-sm resize-none"
                    placeholder={t("streams.enter_prompt_placeholder")}
                    value={promptTemplate?.template || ''}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                />
                <p className="text-sm text-foreground/50 mt-2">
                    {t("streams.placeholder_help")} <code className="px-2 py-1 bg-muted rounded text-primary">{`{{content}}`}</code>.
                </p>
            </div>

            {/* Test Modal */}
            <AnimatePresence>
                {showTestModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowTestModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card rounded-xl border border-border w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{t("streams.test_modal_title")}</h2>
                                        <p className="text-sm text-foreground/60">{t("streams.test_modal_desc")}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTestModal(false)}
                                    className="p-2 hover:bg-muted rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 flex-1 overflow-hidden">
                                <div className="flex flex-col h-full">
                                    <label className="block text-sm font-medium mb-2">{t("streams.sample_content")}</label>
                                    <textarea
                                        className="flex-1 w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary outline-none transition font-mono text-sm resize-none"
                                        value={testContent}
                                        onChange={(e) => setTestContent(e.target.value)}
                                        placeholder={t("streams.enter_sample")}
                                    />
                                </div>
                                <div className="flex flex-col h-full">
                                    <label className="block text-sm font-medium mb-2">
                                        {t("streams.llm_output")}
                                        {testResult?.estimated_cost !== undefined && (
                                            <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                                {t("streams.cost")}: ${testResult.estimated_cost.toFixed(6)}
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex-1 w-full bg-muted border border-border rounded-lg p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                                        {testing ? (
                                            <div className="flex items-center justify-center h-full text-foreground/60">
                                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                                {t("streams.running")}
                                            </div>
                                        ) : testResult?.error ? (
                                            <div className="text-red-500">{testResult.error}</div>
                                        ) : testResult ? (
                                            testResult.output
                                        ) : (
                                            <span className="text-foreground/40 italic">Run test to see output...</span>
                                        )}
                                    </div>
                                    {testResult?.usage && (
                                        <div className="mt-2 text-xs text-foreground/50 flex justify-between">
                                            <span>Input: {testResult.usage.promptTokens}t</span>
                                            <span>Output: {testResult.usage.completionTokens}t</span>
                                            <span>Total: {testResult.usage.totalTokens}t</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-border">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setShowTestModal(false)}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                                >
                                    {t("streams.close")}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={handleTest}
                                    disabled={testing || !testContent}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {testing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <TestTube className="w-4 h-4" />
                                            {t("streams.run_test")}
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
