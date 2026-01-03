'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '../../../../components/PageContainer';
import { getBacktest, getBacktestResults, Backtest, BacktestResult } from '../../../../lib/api';

import { useI18n } from '../../../../lib/i18n-context';

export default function BacktestDetailsPage() {
    const { t } = useI18n();
    const params = useParams();
    const id = params.id as string;

    const [backtest, setBacktest] = useState<Backtest | null>(null);
    const [results, setResults] = useState<BacktestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, page]);

    async function loadData() {
        try {
            const [backtestData, resultsData] = await Promise.all([
                getBacktest(id),
                getBacktestResults(id, page)
            ]);
            setBacktest(backtestData);
            setResults(resultsData.data);
            setTotal(resultsData.total);
        } catch (error) {
            console.error('Failed to load backtest details:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <PageContainer title={t("backtests.loading_details")}>
                <div className="text-center py-12 text-gray-400">{t("backtests.loading_details")}</div>
            </PageContainer>
        );
    }

    if (!backtest) {
        return (
            <PageContainer title={t("backtests.not_found")}>
                <div className="text-center py-12 text-gray-400">{t("backtests.not_found")}</div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={backtest?.name || t("backtests.title")}>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{backtest.name}</h1>
                            <p className="text-gray-400">{backtest.description}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full border ${backtest.status === 'COMPLETED'
                            ? 'bg-green-900/50 text-green-300 border-green-700/50'
                            : backtest.status === 'RUNNING'
                                ? 'bg-blue-900/50 text-blue-300 border-blue-700/50 animate-pulse'
                                : backtest.status === 'FAILED'
                                    ? 'bg-red-900/50 text-red-300 border-red-700/50'
                                    : 'bg-gray-700 text-gray-300 border-gray-600'
                            }`}>
                            {backtest.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm border-t border-gray-700 pt-4">
                        <div>
                            <div className="text-gray-500">{t("backtests.stream_label")}</div>
                            <div className="text-white font-medium">{backtest.stream?.name}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">{t("backtests.range")}</div>
                            <div className="text-white">
                                {new Date(backtest.range_start).toLocaleDateString()} - {new Date(backtest.range_end).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">{t("backtests.processed_items")}</div>
                            <div className="text-white font-medium">{total}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">{t("backtests.duration")}</div>
                            <div className="text-white">
                                {backtest.started_at && backtest.completed_at
                                    ? `${Math.round((new Date(backtest.completed_at).getTime() - new Date(backtest.started_at).getTime()) / 1000)}s`
                                    : '-'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">{t("backtests.results")}</h2>
                    </div>
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t("backtests.col_time")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t("backtests.col_status")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t("backtests.col_output")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t("backtests.col_latency")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {results.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {result.content?.created_at
                                            ? new Date(result.content.created_at).toLocaleString()
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs uppercase font-bold ${result.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
                                            {JSON.stringify(result.output, null, 2)}
                                        </pre>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {result.execution_time_ms}ms
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                        >
                            {t("backtests.prev_page")}
                        </button>
                        <span className="text-gray-400 text-sm">
                            {t("backtests.page_info").replace("{current}", page.toString()).replace("{total}", Math.ceil(total / 50).toString())}
                        </span>
                        <button
                            disabled={page >= Math.ceil(total / 50)}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                        >
                            {t("backtests.next_page")}
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
