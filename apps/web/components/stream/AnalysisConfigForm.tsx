'use client';

import { useState, useEffect } from 'react';

interface AnalysisConfigFormProps {
    initialConfig: any;
    onChange: (config: any) => void;
}

export default function AnalysisConfigForm({ initialConfig, onChange }: AnalysisConfigFormProps) {
    const [config, setConfig] = useState({
        enabled: false,
        ...initialConfig,
    });

    useEffect(() => {
        setConfig({
            enabled: false,
            ...initialConfig,
        });
    }, [initialConfig]);

    const handleChange = (field: string, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        onChange(newConfig);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    id="analysis-enabled"
                    checked={config.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="analysis-enabled" className="text-white/90 font-medium">
                    启用趋势分析
                </label>
            </div>

            {config.enabled && (
                <div className="ml-7 space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400">
                        <p className="mb-2">启用后，系统将自动为每条内容提供：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>关键词提取（Top 5）</li>
                            <li>情感分析（正面/负面/中性）</li>
                            <li>相似内容推荐（最多 3 条）</li>
                        </ul>
                        <p className="mt-3 text-purple-400">
                            💡 分析结果将自动附加到 LLM 的输入中，帮助生成更准确的洞察。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
