'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreamLlmOutputs, getLogs, LlmOutput, Log } from '../../lib/api';
import { FileText, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../lib/i18n-context';

interface StreamLogsProps {
    streamId: string;
}

export default function StreamLogs({ streamId }: StreamLogsProps) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'outputs' | 'logs'>('outputs');

    // Outputs State
    const [outputs, setOutputs] = useState<LlmOutput[]>([]);
    const [outputsLoading, setOutputsLoading] = useState(true);
    const [outputsPage, setOutputsPage] = useState(1);
    const [outputsTotal, setOutputsTotal] = useState(0);

    // Logs State
    const [logs, setLogs] = useState<Log[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);

    const limit = 20;

    useEffect(() => {
        if (activeTab === 'outputs') {
            loadOutputs();
        } else {
            loadLogs();
        }
    }, [streamId, activeTab, outputsPage, logsPage]);

    const loadOutputs = async () => {
        setOutputsLoading(true);
        try {
            const offset = (outputsPage - 1) * limit;
            const { data, total } = await getStreamLlmOutputs(streamId, { limit, offset });
            setOutputs(data);
            setOutputsTotal(total);
        } catch (error) {
            console.error('Failed to load outputs:', error);
        } finally {
            setOutputsLoading(false);
        }
    };

    const loadLogs = async () => {
        setLogsLoading(true);
        try {
            const offset = (logsPage - 1) * limit;
            const { logs, total } = await getLogs({ streamId, limit, offset });
            setLogs(logs);
            setLogsTotal(total);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLogsLoading(false);
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const renderPagination = (page: number, setPage: (p: number) => void, total: number) => {
        const totalPages = Math.ceil(total / limit);
        if (totalPages <= 1) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mt-6 pt-4 border-t border-border"
            >
                <div className="text-sm text-foreground/60">
                    {t("streams.showing_items").replace("{start}", ((page - 1) * limit + 1).toString()).replace("{end}", Math.min(page * limit, total).toString()).replace("{total}", total.toString())}
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={page === 1}
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t("streams.previous")}
                    </motion.button>
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                        {page} / {totalPages}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={page === totalPages}
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition"
                    >
                        {t("streams.next")}
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div >
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Tab Switcher */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('outputs')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition relative ${activeTab === 'outputs'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        {t("streams.tab_llm_outputs")}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('logs')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition relative ${activeTab === 'logs'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        {t("streams.tab_system_logs")}
                    </motion.button>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'outputs' ? loadOutputs : loadLogs}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t("streams.refresh")}
                </motion.button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'outputs' ? (
                    <motion.div
                        key="outputs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {outputsLoading && outputs.length === 0 ? (
                            <div className="text-center py-12 bg-card border border-border rounded-xl">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="inline-block mb-4"
                                >
                                    <RefreshCw className="w-8 h-8 text-primary" />
                                </motion.div>
                                <p className="text-foreground/60">
                                    {t("streams.loading_outputs")}
                                </p>
                            </div>
                        ) : outputs.length === 0 ? (
                            <div className="text-center py-12 bg-card border border-border rounded-xl">
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="text-xl font-semibold mb-2">{t("streams.no_outputs")}</h3>
                                <p className="text-foreground/60">{t("streams.no_outputs_desc")}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {outputs.map((output, index) => (
                                    <motion.div
                                        key={output.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition"
                                    >
                                        <div className="p-4 border-b border-border flex justify-between items-start bg-muted/30">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(output.created_at).toLocaleString()}
                                                </div>
                                                <div className="text-xs font-mono text-primary px-2 py-1 bg-primary/10 rounded inline-block">
                                                    {output.model || t("streams.unknown_model")}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                {t("streams.success")}
                                            </div>
                                        </div>

                                        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    {t("streams.input_content")}
                                                </h4>
                                                <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground/80 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-border">
                                                    {output.content?.raw_content || t("streams.na")}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                                    {t("streams.llm_output_label")}
                                                </h4>
                                                <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground/80 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-border">
                                                    {output.raw_output}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        {renderPagination(outputsPage, setOutputsPage, outputsTotal)}
                    </motion.div>
                ) : (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {logsLoading && logs.length === 0 ? (
                            <div className="text-center py-12 bg-card border border-border rounded-xl">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="inline-block mb-4"
                                >
                                    <RefreshCw className="w-8 h-8 text-primary" />
                                </motion.div>
                                <p className="text-foreground/60">{t("streams.loading_logs")}</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 bg-card border border-border rounded-xl">
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-xl font-semibold mb-2">{t("streams.no_logs")}</h3>
                                <p className="text-foreground/60">{t("streams.no_logs_desc")}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`bg-card rounded-lg border p-4 flex items-start gap-3 hover:shadow-md transition ${getLogColor(log.type)}`}
                                    >
                                        <div className="mt-0.5">
                                            {getLogIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${log.type === 'error' ? 'bg-red-500/20 text-red-500' :
                                                    log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {log.type.toUpperCase()}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/90 font-mono whitespace-pre-wrap break-words leading-relaxed">
                                                {log.message}
                                            </p>
                                            {log.content && (
                                                <div className="mt-3 text-xs text-foreground/60 bg-muted/50 p-2 rounded border border-border">
                                                    {t("streams.content_id")} <span className="font-mono text-primary">{log.content.external_id || log.content.id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        {renderPagination(logsPage, setLogsPage, logsTotal)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
