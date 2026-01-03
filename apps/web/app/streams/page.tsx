'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { getStreams, getSources, createStream, toggleStreamStatus, cloneStream, getStreamTemplates, Stream, Source, StreamTemplate } from '../../lib/api';
import { Plus, Play, Pause, Zap, MessageSquare, Bell, ArrowRight, Sparkles, Loader2, Copy, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading, Skeleton } from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { StreamStats } from '../../components/StreamStats';

export default function StreamsPage() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [templates, setTemplates] = useState<StreamTemplate[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [cloningId, setCloningId] = useState<string | null>(null);
    const [expandedStats, setExpandedStats] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<StreamTemplate | null>(null);
    const { showToast, ToastContainer } = useToast();
    const [newStream, setNewStream] = useState({
        name: '',
        source_id: '',
        triggerPrompt: '',
        notificationPrompt: '',
        recipient: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [streamsData, sourcesData, templatesData] = await Promise.all([
                getStreams(),
                getSources(),
                getStreamTemplates(),
            ]);
            setStreams(streamsData);
            setSources(sourcesData);
            setTemplates(templatesData);
            if (sourcesData.length > 0) {
                setNewStream(prev => ({ ...prev, source_id: sourcesData[0].id }));
            }
        } catch (error) {
            console.error('Failed to load data', error);
            showToast('error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStream.name.trim()) {
            showToast('error', 'Stream name is required');
            return;
        }

        if (!newStream.triggerPrompt.trim() || !newStream.notificationPrompt.trim()) {
            showToast('error', 'Both prompts are required');
            return;
        }

        try {
            setIsSubmitting(true);
            await createStream({
                name: newStream.name,
                source_id: newStream.source_id,

                prompt_template: {
                    triggerPrompt: newStream.triggerPrompt,
                    notificationPrompt: newStream.notificationPrompt
                },
                notification_config: {
                    channel: 'telegram',
                    recipient: newStream.recipient
                }
            });
            showToast('success', 'Stream created successfully!');
            setIsModalOpen(false);
            setSelectedTemplate(null);
            setNewStream({
                name: '',
                source_id: sources[0]?.id || '',
                triggerPrompt: '',
                notificationPrompt: '',
                recipient: ''
            });
            loadData();
        } catch (error: any) {
            console.error('Failed to create stream', error);
            const errorMessage = error.response?.data?.message || 'Failed to create stream';
            showToast('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (stream: Stream) => {
        try {
            setTogglingId(stream.id);
            const action = stream.status === 'active' ? 'pause' : 'start';
            await toggleStreamStatus(stream.id);
            showToast('success', `Stream ${action === 'pause' ? 'paused' : 'started'} successfully`);
            loadData();
        } catch (error) {
            console.error('Failed to toggle stream', error);
            showToast('error', 'Failed to toggle stream');
        } finally {
            setTogglingId(null);
        }
    };

    const handleClone = async (streamId: string) => {
        try {
            setCloningId(streamId);
            await cloneStream(streamId);
            showToast('success', 'Stream cloned successfully!');
            loadData();
        } catch (error) {
            console.error('Failed to clone stream', error);
            showToast('error', 'Failed to clone stream');
        } finally {
            setCloningId(null);
        }
    };

    const handleTemplateSelect = (template: StreamTemplate) => {
        setSelectedTemplate(template);
        setNewStream(prev => ({
            ...prev,
            name: template.name,
            triggerPrompt: template.promptTemplate.triggerPrompt,
            notificationPrompt: template.promptTemplate.notificationPrompt,
        }));
    };

    return (
        <PageContainer
            title="Intelligence Streams"
            action={
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isLoading || sources.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <Plus className="w-5 h-5" />
                    Create Stream
                </button>
            }
        >
            <ToastContainer />            <div className="grid grid-cols-1 gap-6">
                {streams.map((stream) => (
                    <Card key={stream.id} className="group border-l-4 border-l-transparent hover:border-l-primary">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-5">
                                <div className={`p-4 rounded-2xl ${stream.status === 'active'
                                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                    : 'bg-white/[0.05] text-gray-400'
                                    }`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{stream.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {stream.source?.identifier}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-gray-600" />
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                            <Bell className="w-3.5 h-3.5" />
                                            Telegram
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpandedStats(expandedStats === stream.id ? null : stream.id)}
                                    className={`p-3 rounded-xl transition-all duration-300 ${expandedStats === stream.id
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-white/[0.03] hover:bg-white/[0.05] text-gray-400 hover:text-white border border-white/[0.05]'
                                        }`}
                                    title="View Statistics"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleClone(stream.id)}
                                    disabled={cloningId === stream.id}
                                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] text-gray-400 hover:text-white border border-white/[0.05] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Clone Stream"
                                >
                                    {cloningId === stream.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleToggle(stream)}
                                    disabled={togglingId === stream.id}
                                    className={`p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${stream.status === 'active'
                                        ? 'bg-white/[0.03] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/[0.05] hover:border-red-500/20'
                                        : 'bg-primary/10 hover:bg-primary/20 text-primary hover:text-white border border-primary/20 hover:border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        }`}
                                    title={stream.status === 'active' ? 'Pause Stream' : 'Start Stream'}
                                >
                                    {togglingId === stream.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : stream.status === 'active' ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Sparkles className="w-12 h-12" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Trigger Logic
                                </p>
                                <p className="text-sm text-gray-300 line-clamp-3 font-mono leading-relaxed opacity-80">
                                    {stream.prompt_template.triggerPrompt}
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Bell className="w-12 h-12" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    Notification Format
                                </p>
                                <p className="text-sm text-gray-300 line-clamp-3 font-mono leading-relaxed opacity-80">
                                    {stream.prompt_template.notificationPrompt}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedStats === stream.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <StreamStats streamId={stream.id} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl my-8 relative"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                            <h2 className="text-2xl font-bold text-white mb-8 relative z-10">Create Intelligence Stream</h2>

                            {/* Templates Section */}
                            <div className="mb-8 relative z-10">
                                <label className="block text-sm font-medium text-gray-300 mb-3">Start from a Template</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {templates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedTemplate?.id === template.id
                                                ? 'bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                                : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                                                }`}
                                        >
                                            <div className="font-medium text-sm mb-1">{template.name}</div>
                                            <div className="text-xs opacity-60 line-clamp-2">{template.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Stream Name</label>
                                        <input
                                            type="text"
                                            value={newStream.name}
                                            onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            placeholder="e.g. Elon AI Monitor"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                                        <select
                                            value={newStream.source_id}
                                            onChange={(e) => setNewStream({ ...newStream, source_id: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                                            required
                                        >
                                            {sources.map(s => (
                                                <option key={s.id} value={s.id} className="bg-gray-900">{s.identifier} ({s.type})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-300">Trigger Prompt (LLM)</label>
                                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Must return TRUE/FALSE</span>
                                        </div>
                                        <textarea
                                            value={newStream.triggerPrompt}
                                            onChange={(e) => setNewStream({ ...newStream, triggerPrompt: e.target.value })}
                                            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                            placeholder="Analyze this content: {{content}}. Does it mention AI? Answer TRUE or FALSE."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-300">Notification Prompt (LLM)</label>
                                            <span className="text-xs text-gray-500">Supports markdown</span>
                                        </div>
                                        <textarea
                                            value={newStream.notificationPrompt}
                                            onChange={(e) => setNewStream({ ...newStream, notificationPrompt: e.target.value })}
                                            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                            placeholder="Summarize this content in 2 sentences: {{content}}"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telegram Chat ID</label>
                                    <input
                                        type="text"
                                        value={newStream.recipient}
                                        onChange={(e) => setNewStream({ ...newStream, recipient: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. 123456789"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Stream'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
}
