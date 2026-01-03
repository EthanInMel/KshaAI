'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Zap, Settings as SettingsIcon } from 'lucide-react';
import { useI18n } from '../../lib/i18n-context';

interface AggregationConfigFormProps {
    initialConfig?: any;
    onChange: (config: any) => void;
}

export default function AggregationConfigForm({ initialConfig, onChange }: AggregationConfigFormProps) {
    const { t } = useI18n();
    const [config, setConfig] = useState({
        type: 'realtime',
        dailyReport: {
            enabled: false,
            time: '08:00',
            timezone: 'Asia/Shanghai',
        },
        digest: {
            enabled: false,
            interval: 'daily', // hourly, daily, weekly
            time: '18:00',
        },
        ...initialConfig,
    });

    useEffect(() => {
        setConfig({
            type: 'realtime',
            dailyReport: {
                enabled: false,
                time: '08:00',
                timezone: 'Asia/Shanghai',
            },
            digest: {
                enabled: false,
                interval: 'daily',
                time: '18:00',
            },
            ...initialConfig,
        });
    }, [initialConfig]);

    const handleChange = (field: string, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        onChange(newConfig);
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        const newConfig = {
            ...config,
            [parent]: {
                ...config[parent],
                [field]: value,
            },
        };
        setConfig(newConfig);
        onChange(newConfig);
    };

    return (
        <div className="space-y-6">
            {/* 处理模式选择 */}
            <div>
                <label className="block text-sm font-medium mb-3">{t("streams.processing_mode")}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange('type', 'realtime')}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition ${config.type === 'realtime'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.type === 'realtime' ? 'bg-primary/20' : 'bg-muted'}`}>
                                <Zap className={`w-5 h-5 ${config.type === 'realtime' ? 'text-primary' : 'text-foreground/60'}`} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">{t("streams.realtime")}</div>
                                <div className="text-sm text-foreground/60 mt-1">
                                    {t("streams.realtime_desc")}
                                </div>
                            </div>
                        </div>
                        {config.type === 'realtime' && (
                            <motion.div
                                layoutId="selectedMode"
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange('type', 'digest')}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition ${config.type === 'digest'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.type === 'digest' ? 'bg-primary/20' : 'bg-muted'}`}>
                                <Calendar className={`w-5 h-5 ${config.type === 'digest' ? 'text-primary' : 'text-foreground/60'}`} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">{t("streams.digest")}</div>
                                <div className="text-sm text-foreground/60 mt-1">
                                    {t("streams.digest_desc")}
                                </div>
                            </div>
                        </div>
                        {config.type === 'digest' && (
                            <motion.div
                                layoutId="selectedMode"
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Digest 模式配置 */}
            {config.type === 'digest' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-muted/50 rounded-lg border border-border space-y-4"
                >
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <SettingsIcon className="w-4 h-4" />
                        {t("streams.digest_config")}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t("streams.interval")}</label>
                            <select
                                value={config.digest.interval}
                                onChange={(e) => handleNestedChange('digest', 'interval', e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
                            >
                                <option value="hourly">{t("streams.every_hour")}</option>
                                <option value="daily">{t("streams.daily")}</option>
                                <option value="weekly">{t("streams.weekly")}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">{t("streams.time")}</label>
                            <input
                                type="time"
                                value={config.digest.time}
                                onChange={(e) => handleNestedChange('digest', 'time', e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Daily Report 配置 */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("streams.daily_report")}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.dailyReport.enabled}
                            onChange={(e) => handleNestedChange('dailyReport', 'enabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="text-sm text-foreground/60">
                    {t("streams.daily_report_desc")}
                </div>

                {config.dailyReport.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-3 border-t border-border"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">{t("streams.report_time")}</label>
                                <input
                                    type="time"
                                    value={config.dailyReport.time}
                                    onChange={(e) => handleNestedChange('dailyReport', 'time', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t("streams.timezone")}</label>
                                <select
                                    value={config.dailyReport.timezone}
                                    onChange={(e) => handleNestedChange('dailyReport', 'timezone', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
                                >
                                    <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                                    <option value="America/New_York">America/New_York (UTC-5)</option>
                                    <option value="Europe/London">Europe/London (UTC+0)</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-500">
                                {t("streams.report_schedule").replace("{time}", config.dailyReport.time)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
