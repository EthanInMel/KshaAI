'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { getSources, createSource, Source } from '../../lib/api';
import { Plus, Twitter, Rss, Globe, Radio, Search, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading, Skeleton } from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSource, setNewSource] = useState({ type: 'x', identifier: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string }>({});
    const { showToast, ToastContainer } = useToast();

    useEffect(() => {
        loadSources();
    }, []);

    const loadSources = async () => {
        try {
            setIsLoading(true);
            const data = await getSources();
            setSources(data);
        } catch (error) {
            console.error('Failed to load sources', error);
            showToast('error', 'Failed to load sources');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { identifier?: string } = {};

        if (!newSource.identifier.trim()) {
            newErrors.identifier = 'This field is required';
        } else if (newSource.type === 'x') {
            // Validate X username (no @ symbol, alphanumeric and underscore)
            const username = newSource.identifier.replace('@', '');
            if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
                newErrors.identifier = 'Invalid X username (max 15 characters, alphanumeric and underscore only)';
            }
        } else if (newSource.type === 'rss') {
            // Validate URL
            try {
                new URL(newSource.identifier);
            } catch {
                newErrors.identifier = 'Invalid URL format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            const identifier = newSource.type === 'x'
                ? newSource.identifier.replace('@', '')
                : newSource.identifier;

            await createSource({
                type: newSource.type as any,
                identifier,
                config: {}
            });

            showToast('success', 'Source created successfully!');
            setIsModalOpen(false);
            setNewSource({ type: 'x', identifier: '' });
            setErrors({});
            loadSources();
        } catch (error: any) {
            console.error('Failed to create source', error);
            const errorMessage = error.response?.data?.message || 'Failed to create source';
            showToast('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'x': return <Twitter className="w-6 h-6 text-white" />;
            case 'rss': return <Rss className="w-6 h-6 text-white" />;
            default: return <Globe className="w-6 h-6 text-white" />;
        }
    };

    const getGradient = (type: string) => {
        switch (type) {
            case 'x': return 'from-blue-500 to-blue-600';
            case 'rss': return 'from-orange-500 to-red-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <PageContainer
            title="Data Sources"
            action={
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <Plus className="w-5 h-5" />
                    Add Source
                </button>
            }
        >
            <ToastContainer />

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search sources..."
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                    <Filter className="w-5 h-5" />
                    Filter
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <Skeleton className="w-14 h-14 rounded-2xl" />
                                <Skeleton className="w-16 h-6 rounded-lg" />
                            </div>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-6" />
                            <Skeleton className="h-4 w-full" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sources.map((source) => (
                        <Card key={source.id} className="group relative border-t-4 border-t-transparent hover:border-t-primary/50">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${getGradient(source.type)} shadow-lg`}>
                                    {getIcon(source.type)}
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Active
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{source.identifier}</h3>
                            <p className="text-sm text-gray-400 mb-6 capitalize font-medium">{source.type} Source</p>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/[0.05]">
                                <span className="flex items-center gap-1.5">
                                    <Radio className="w-3.5 h-3.5" />
                                    Last polled
                                </span>
                                <span className="font-mono text-gray-400">
                                    {source.last_polled_at ? new Date(source.last_polled_at).toLocaleTimeString() : 'Never'}
                                </span>
                            </div>
                        </Card>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/[0.02] transition-all duration-300 min-h-[200px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-400 group-hover:text-white transition-colors">Add New Source</h3>
                        <p className="text-sm text-gray-600 mt-1">Connect to X, RSS, or Webhooks</p>
                    </button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Add New Source</h2>
                            <p className="text-gray-400 mb-8 relative z-10">Connect a new data source to start monitoring.</p>

                            <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Source Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['x', 'rss'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    setNewSource({ ...newSource, type, identifier: '' });
                                                    setErrors({});
                                                }}
                                                disabled={isSubmitting}
                                                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${newSource.type === type
                                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                                    : 'bg-white/[0.03] border-transparent text-gray-400 hover:bg-white/[0.05] hover:border-white/10'
                                                    }`}
                                            >
                                                {type === 'x' ? <Twitter className="w-8 h-8" /> : <Rss className="w-8 h-8" />}
                                                <span className="capitalize font-semibold">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {newSource.type === 'x' ? 'Username' : 'Feed URL'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            {newSource.type === 'x' ? '@' : <Globe className="w-5 h-5" />}
                                        </div>
                                        <input
                                            type="text"
                                            value={newSource.identifier}
                                            onChange={(e) => {
                                                setNewSource({ ...newSource, identifier: e.target.value });
                                                setErrors({});
                                            }}
                                            disabled={isSubmitting}
                                            className={`w-full bg-white/[0.03] border ${errors.identifier ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                            placeholder={newSource.type === 'x' ? 'elonmusk' : 'https://example.com/feed'}
                                        />
                                    </div>
                                    {errors.identifier && (
                                        <p className="mt-2 text-sm text-red-400">{errors.identifier}</p>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-8">
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
                                            'Create Source'
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
