'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import { useI18n } from '../../lib/i18n-context';

interface StreamInsights {
    period: string;
    totalContent: number;
    topCategories: { name: string; count: number }[];
    topEntities: { type: string; name: string; count: number }[];
    topTopics: { name: string; relevance: number }[];
    averageImportance: number;
    averageSentiment: number;
    sentimentDistribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
}

interface Props {
    streamId: string;
    days?: number;
}

export default function StreamInsights({ streamId, days = 7 }: Props) {
    const { t } = useI18n();
    const [insights, setInsights] = useState<StreamInsights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, [streamId, days]);

    const loadInsights = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/analytics/stream/${streamId}/insights?days=${days}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to load insights');

            const data = await response.json();
            setInsights(data);
        } catch (error) {
            console.error('Failed to load insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-center text-foreground/60">{t("streams.loading_insights")}</div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-center text-foreground/60">{t("streams.no_insights")}</div>
            </div>
        );
    }

    const getSentimentColor = (score: number) => {
        if (score > 0.2) return 'text-green-400';
        if (score < -0.2) return 'text-red-400';
        return 'text-foreground/60';
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-foreground/60">{t("streams.total_content")}</div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                        {insights.totalContent}
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">{t("streams.last_period").replace("{period}", insights.period)}</div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-foreground/60">{t("streams.avg_importance")}</div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                        {(insights.averageImportance * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">{t("streams.newsworthy_score")}</div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-foreground/60">{t("streams.avg_sentiment")}</div>
                    <div className={`text-2xl font-bold mt-1 ${getSentimentColor(insights.averageSentiment)}`}>
                        {(insights.averageSentiment * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">{t("streams.overall_tone")}</div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-foreground/60">{t("streams.sentiment_mix")}</div>
                    <div className="flex gap-2 mt-2">
                        <div className="flex-1 text-center">
                            <div className="text-green-400 font-bold">{insights.sentimentDistribution.positive}</div>
                            <div className="text-xs text-foreground/50">+</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-foreground/60 font-bold">{insights.sentimentDistribution.neutral}</div>
                            <div className="text-xs text-foreground/50">~</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-red-400 font-bold">{insights.sentimentDistribution.negative}</div>
                            <div className="text-xs text-foreground/50">-</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Categories */}
                <div className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">📁 {t("streams.top_categories")}</h3>
                    {insights.topCategories.length > 0 ? (
                        <div className="space-y-3">
                            {insights.topCategories.map((cat, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-foreground/80">{cat.name}</span>
                                    <span className="text-purple-400 font-semibold">{cat.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-foreground/50 text-sm">{t("streams.no_categories")}</div>
                    )}
                </div>

                {/* Top Topics */}
                <div className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">💡 {t("streams.top_topics")}</h3>
                    {insights.topTopics.length > 0 ? (
                        <div className="space-y-3">
                            {insights.topTopics.map((topic, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-foreground/80 text-sm">{topic.name}</span>
                                        <span className="text-blue-400 text-xs">
                                            {(topic.relevance * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{ width: `${topic.relevance * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-foreground/50 text-sm">{t("streams.no_topics")}</div>
                    )}
                </div>

                {/* Top Entities */}
                <div className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">🏷️ {t("streams.key_entities")}</h3>
                    {insights.topEntities.length > 0 ? (
                        <div className="space-y-2">
                            {insights.topEntities.slice(0, 8).map((entity, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-foreground/50 uppercase">
                                            {entity.type}
                                        </span>
                                        <span className="text-foreground/80">{entity.name}</span>
                                    </div>
                                    <span className="text-green-400 font-semibold">{entity.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-foreground/50 text-sm">{t("streams.no_entities")}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
