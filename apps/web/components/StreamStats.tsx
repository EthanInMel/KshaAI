'use client';

import { useEffect, useState } from 'react';
import { getStreamStatistics, StreamStatistics } from '../lib/api';
import { TrendingUp, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { Skeleton } from './Loading';

interface StreamStatsProps {
    streamId: string;
}

export const StreamStats: React.FC<StreamStatsProps> = ({ streamId }) => {
    const [stats, setStats] = useState<StreamStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [streamId]);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const data = await getStreamStatistics(streamId);
            setStats(data);
        } catch (error) {
            console.error('Failed to load statistics', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-500 font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalProcessed}</div>
            </div>

            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-500 font-medium">Success</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{stats.successCount}</div>
                <div className="text-xs text-gray-500 mt-1">{stats.successRate}%</div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-500 font-medium">Errors</span>
                </div>
                <div className="text-2xl font-bold text-red-400">{stats.errorCount}</div>
                <div className="text-xs text-gray-500 mt-1">{stats.errorRate}%</div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-500 font-medium">7 Days</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{stats.recentActivity}</div>
            </div>
        </div>
    );
};
