'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getStream, updateStream, toggleStreamStatus, stopStream, Stream, API_BASE_URL } from '../../../../lib/api';
import LlmConfigForm from '../../../../components/stream/LlmConfigForm';
import NotificationConfigForm from '../../../../components/stream/NotificationConfigForm';
import AnalysisConfigForm from '../../../../components/stream/AnalysisConfigForm';
import AggregationConfigForm from '../../../../components/stream/AggregationConfigForm';
import StreamLogs from '../../../../components/stream/StreamLogs';
import StreamInsights from '../../../../components/stream/StreamInsights';
import { ArrowLeft, PlayCircle, PauseCircle, StopCircle, Settings, FileText, Eye, Sparkles, Save, BarChart3, Zap, Bell, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useI18n } from '../../../../lib/i18n-context';

export default function StreamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { t } = useI18n();

    const [stream, setStream] = useState<Stream | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'logs' | 'settings'>('overview');
    const [saving, setSaving] = useState(false);

    // Form state for settings
    const [formData, setFormData] = useState<{
        name: string;
        llm_config: {
            provider: string;
            model: string;
            temperature: number;
            max_tokens?: number;
            api_key?: string;
            base_url?: string;
        };
        prompt_template: any;
        notification_config: any;
        analysis_config: any;
        aggregation_config: any;
    }>({
        name: '',
        llm_config: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
        },
        prompt_template: {
            template: '',
        },
        notification_config: {},
        analysis_config: {
            enabled: false,
        },
        aggregation_config: {
            type: 'realtime',
            dailyReport: {
                enabled: false,
            },
        },
    });

    useEffect(() => {
        if (id) {
            loadStream();
        }
    }, [id]);

    const loadStream = async () => {
        try {
            const data = await getStream(id);
            setStream(data);
            const llmConfig = (data.llm_config || {}) as any;
            setFormData({
                name: data.name,
                llm_config: {
                    provider: llmConfig.provider || 'openai',
                    model: llmConfig.model || 'gpt-3.5-turbo',
                    temperature: llmConfig.temperature ?? 0.7,
                    max_tokens: llmConfig.max_tokens,
                    api_key: llmConfig.api_key,
                    base_url: llmConfig.base_url,
                },
                prompt_template: data.prompt_template || { template: '' },
                notification_config: data.notification_config || { channels: [] },
                analysis_config: data.analysis_config || { enabled: false },
                aggregation_config: data.aggregation_config || {
                    type: 'realtime',
                    dailyReport: { enabled: false },
                },
            });
        } catch (error) {
            console.error('Failed to load stream:', error);
            toast.error(t("streams.load_failed"));
            router.push('/dashboard/streams');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await updateStream(id, formData);
            toast.success(t("streams.settings_saved"));
            loadStream(); // Reload to ensure sync
        } catch (error: any) {
            toast.error(error.message || t("streams.settings_save_failed"));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleStreamStatus(id);
            toast.success(t("streams.status_updated"));
            loadStream();
        } catch (error) {
            toast.error(t("streams.status_update_failed"));
        }
    };

    const handleStopStream = async () => {
        if (!confirm(t("streams.stop_confirm"))) return;
        try {
            await stopStream(id);
            toast.success(t("streams.stream_stopped"));
            loadStream();
        } catch (error) {
            toast.error(t("streams.stop_failed"));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}><PlayCircle className="w-5 h-5 text-green-500" /></motion.div>;
            case 'paused': return <PauseCircle className="w-5 h-5 text-yellow-500" />;
            case 'stopped': return <StopCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'stopped': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="p-6">
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">{t("streams.not_found")}</h3>
                    <p className="text-foreground/60 mb-4">{t("streams.not_found_desc")}</p>
                    <button
                        onClick={() => router.push('/dashboard/streams')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                        {t("streams.back_to_streams")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/streams')}
                        className="p-2 hover:bg-muted rounded-lg transition flex items-center gap-2 text-foreground/60 hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {stream.name || t("streams.unnamed_stream")}
                            <motion.div
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(stream.status)}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                {getStatusIcon(stream.status)}
                                <span className="capitalize">{stream.status}</span>
                            </motion.div>
                        </h1>
                        <p className="text-sm text-foreground/60 mt-1">
                            {stream.source ? `${stream.source.type.toUpperCase()} • ${stream.source.identifier.substring(0, 60)}` : t("streams.no_source")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Control Buttons */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${stream.status === 'active'
                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            }`}
                        title={stream.status === 'active' ? t("streams.pause_stream") : t("streams.activate_stream")}
                    >
                        {stream.status === 'active' ? (
                            <>
                                <PauseCircle className="w-4 h-4" />
                                {t("streams.pause")}
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4" />
                                {t("streams.activate")}
                            </>
                        )}
                    </motion.button>

                    {stream.status !== 'paused' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStopStream}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition font-medium"
                            title={t("streams.stop_stream")}
                        >
                            <StopCircle className="w-4 h-4" />
                            {t("streams.stop")}
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
            >
                <div className="flex items-center border-b border-border">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={<Eye className="w-4 h-4" />}
                        label={t("streams.tab_overview")}
                    />
                    <TabButton
                        active={activeTab === 'insights'}
                        onClick={() => setActiveTab('insights')}
                        icon={<Sparkles className="w-4 h-4" />}
                        label={t("streams.tab_insights")}
                    />
                    <TabButton
                        active={activeTab === 'logs'}
                        onClick={() => setActiveTab('logs')}
                        icon={<FileText className="w-4 h-4" />}
                        label={t("streams.tab_logs")}
                    />
                    <TabButton
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                        icon={<Settings className="w-4 h-4" />}
                        label={t("streams.tab_settings")}
                    />
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && <OverviewTab stream={stream} />}
                            {activeTab === 'insights' && (
                                <InsightsTab
                                    streamId={id}
                                    analysisConfig={formData.analysis_config}
                                    onAnalysisConfigChange={(config) => {
                                        setFormData({ ...formData, analysis_config: config });
                                        handleSaveSettings();
                                    }}
                                />
                            )}
                            {activeTab === 'logs' && <StreamLogs streamId={id} />}
                            {activeTab === 'settings' && (
                                <SettingsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    saving={saving}
                                    onSave={handleSaveSettings}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <motion.button
            whileHover={{ backgroundColor: 'rgba(var(--muted), 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${active ? 'text-primary' : 'text-foreground/60 hover:text-foreground'
                }`}
        >
            {icon}
            <span>{label}</span>
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
        </motion.button>
    );
}

// Insights Tab with AI Config
function InsightsTab({
    streamId,
    analysisConfig,
    onAnalysisConfigChange,
}: {
    streamId: string;
    analysisConfig: any;
    onAnalysisConfigChange: (config: any) => void;
}) {
    const { t } = useI18n();
    return (
        <div className="space-y-6">
            {/* AI Analysis Toggle */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{t("streams.ai_analysis_title")}</h3>
                            <p className="text-sm text-foreground/60">
                                {t("streams.ai_analysis_desc")}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={analysisConfig?.enabled || false}
                            onChange={(e) => onAnalysisConfigChange({ ...analysisConfig, enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                {analysisConfig?.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-foreground/70 bg-background/50 rounded-lg p-4 border border-border/50"
                    >
                        <p className="mb-2 font-medium">{t("streams.ai_features_title")}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t("streams.ai_feature_1")}</li>
                            <li>{t("streams.ai_feature_2")}</li>
                            <li>{t("streams.ai_feature_3")}</li>
                            <li>{t("streams.ai_feature_4")}</li>
                            <li>{t("streams.ai_feature_5")}</li>
                        </ul>
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-600 dark:text-yellow-500 text-xs">
                            {t("streams.ai_cost_warning")}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Insights Display */}
            {analysisConfig?.enabled ? (
                <StreamInsights streamId={streamId} days={7} />
            ) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold mb-2">{t("streams.ai_disabled_title")}</h3>
                    <p className="text-foreground/60 mb-4">
                        {t("streams.ai_disabled_desc")}
                    </p>
                </div>
            )}
        </div>
    );
}

function OverviewTab({ stream }: { stream: Stream }) {
    const { t } = useI18n();
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        loadContentStats();
    }, [stream.id]);

    const loadContentStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stream/${stream.id}/content-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to load stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to load content stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Content Statistics Cards */}
            {!loadingStats && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/20"
                    >
                        <div className="text-sm text-foreground/60 mb-1">{t("streams.total_content")}</div>
                        <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
                        <div className="text-xs text-foreground/40 mt-1">{t("streams.all_time")}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/20"
                    >
                        <div className="text-sm text-foreground/60 mb-1">{t("streams.processed")}</div>
                        <div className="text-3xl font-bold text-green-500">{stats.processed}</div>
                        <div className="text-xs text-foreground/40 mt-1">
                            {stats.total > 0 ? ((stats.processed / stats.total) * 100).toFixed(1) : 0}% {t("streams.processed").toLowerCase()}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-4 border border-yellow-500/20"
                    >
                        <div className="text-sm text-foreground/60 mb-1">{t("streams.unprocessed")}</div>
                        <div className="text-3xl font-bold text-yellow-500">{stats.unprocessed}</div>
                        <div className="text-xs text-foreground/40 mt-1">{t("streams.pending")}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-4 border border-red-500/20"
                    >
                        <div className="text-sm text-foreground/60 mb-1">{t("streams.failed")}</div>
                        <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
                        <div className="text-xs text-foreground/40 mt-1">{t("streams.errors")}</div>
                    </motion.div>
                </div>
            )}

            {/* 24h Statistics */}
            {!loadingStats && stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-lg p-4 border border-border"
                >
                    <h4 className="text-sm font-semibold mb-3 text-foreground/80">{t("streams.last_24h")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.recent24h?.total || 0}</div>
                                <div className="text-xs text-foreground/60">{t("streams.new_content")}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.recent24h?.processed || 0}</div>
                                <div className="text-xs text-foreground/60">{t("streams.processed")}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stream Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-border/50"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t("streams.details_title")}
                    </h3>
                    <dl className="space-y-4">
                        <div className="flex items-start justify-between py-2 border-b border-border/50">
                            <dt className="text-sm text-foreground/60">{t("streams.source_type")}</dt>
                            <dd className="text-sm font-medium text-right max-w-[60%]">
                                <div className="font-semibold">{stream.source?.type.toUpperCase()}</div>
                                <div className="text-xs text-foreground/60 mt-0.5 truncate">{stream.source?.identifier}</div>
                            </dd>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <dt className="text-sm text-foreground/60">{t("streams.created_at")}</dt>
                            <dd className="text-sm font-medium">
                                {new Date(stream.created_at).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <dt className="text-sm text-foreground/60">{t("streams.provider")}</dt>
                            <dd className="text-sm font-medium capitalize">
                                {stream.llm_config?.provider || 'OpenAI'}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <dt className="text-sm text-foreground/60">{t("streams.model")}</dt>
                            <dd className="text-sm font-medium font-mono">
                                {stream.llm_config?.model || 'gpt-3.5-turbo'}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <dt className="text-sm text-foreground/60">{t("streams.processing_mode")}</dt>
                            <dd className="text-sm font-medium capitalize">
                                {stream.aggregation_config?.type || 'realtime'}
                            </dd>
                        </div>
                    </dl>
                </motion.div>

                {/* Prompt Template Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-border/50"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t("streams.prompt_template")}
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-foreground/80 whitespace-pre-wrap max-h-[200px] overflow-y-auto border border-border/50">
                        {stream.prompt_template?.template || t("streams.no_template")}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function SettingsTab({
    formData,
    setFormData,
    saving,
    onSave,
}: {
    formData: any;
    setFormData: (data: any) => void;
    saving: boolean;
    onSave: () => void;
}) {
    const { t } = useI18n();
    const [expandedSection, setExpandedSection] = useState<string | null>('general');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const ConfigSection = ({
        id,
        title,
        icon: Icon,
        description,
        children,
        gradient
    }: {
        id: string;
        title: string;
        icon: any;
        description: string;
        children: React.ReactNode;
        gradient: string;
    }) => {
        const isExpanded = expandedSection === id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
            >
                <button
                    onClick={() => toggleSection(id)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{title}</h3>
                            <p className="text-sm text-foreground/60">{description}</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-foreground/40"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 pt-0 border-t border-border/50">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Quick Actions Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-xl border border-primary/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="font-semibold">{t("streams.config_title")}</div>
                        <div className="text-sm text-foreground/60">{t("streams.config_desc")}</div>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium shadow-lg"
                >
                    {saving ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Save className="w-5 h-5" />
                            </motion.div>
                            {t("streams.saving_btn")}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t("streams.save_all")}
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* General Settings */}
            <ConfigSection
                id="general"
                title={t("streams.general_settings")}
                icon={Settings}
                description={t("streams.general_desc")}
                gradient="from-gray-500 to-gray-600"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <span>{t("streams.stream_name")}</span>
                            <span className="text-xs text-foreground/50">{t("streams.required")}</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            placeholder={t("streams.stream_name_placeholder")}
                        />
                        <p className="text-xs text-foreground/50 mt-2">
                            {t("streams.name_help")}
                        </p>
                    </div>
                </div>
            </ConfigSection>

            {/* LLM Configuration */}
            <ConfigSection
                id="llm"
                title={t("streams.llm_config_title")}
                icon={Zap}
                description={t("streams.llm_config_desc")}
                gradient="from-purple-500 to-purple-600"
            >
                <LlmConfigForm
                    config={formData.llm_config}
                    promptTemplate={formData.prompt_template}
                    onChange={(config, template) =>
                        setFormData({ ...formData, llm_config: config, prompt_template: template })
                    }
                />
            </ConfigSection>

            {/* Aggregation & Reports */}
            <ConfigSection
                id="aggregation"
                title={t("streams.aggregation_title")}
                icon={Calendar}
                description={t("streams.aggregation_desc")}
                gradient="from-blue-500 to-blue-600"
            >
                <AggregationConfigForm
                    initialConfig={formData.aggregation_config}
                    onChange={(config) => setFormData({ ...formData, aggregation_config: config })}
                />
            </ConfigSection>

            {/* Notification Configuration */}
            <ConfigSection
                id="notifications"
                title={t("settings.notifications")}
                icon={Bell}
                description={t("streams.notifications_config_desc")}
                gradient="from-green-500 to-green-600"
            >
                <NotificationConfigForm
                    config={formData.notification_config}
                    onChange={(config) => setFormData({ ...formData, notification_config: config })}
                />
            </ConfigSection>

            {/* Sticky Save Button (Mobile) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:hidden sticky bottom-4 z-10"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium shadow-2xl"
                >
                    {saving ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Save className="w-5 h-5" />
                            </motion.div>
                            {t("streams.saving_btn")}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t("streams.save_all")}
                        </>
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
}
