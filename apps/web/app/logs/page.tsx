'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Terminal, Filter, X } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { getLogs, getStreams, Log, Stream } from '../../lib/api';
import { Pagination } from '../../components/Pagination';
import { Loading, Skeleton } from '../../components/Loading';

export default function LogsPage() {
    const { socket, isConnected } = useSocket();
    const [logs, setLogs] = useState<Log[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        stream_id: '',
        type: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Load historical logs
    useEffect(() => {
        loadLogs();
    }, [currentPage, filters]);

    // Load streams for filter
    useEffect(() => {
        loadStreams();
    }, []);

    // Listen for real-time logs
    useEffect(() => {
        if (!socket) return;

        socket.on('log', (newLog: Log) => {
            console.log('Received log:', newLog);
            // Only add to current page if on page 1 and filters match
            if (currentPage === 1 && matchesFilters(newLog)) {
                setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50));
                setTotal((prev) => prev + 1);
            }
        });

        return () => {
            socket.off('log');
        };
    }, [socket, currentPage, filters]);

    const matchesFilters = (log: Log) => {
        if (filters.stream_id && log.stream_id !== filters.stream_id) return false;
        if (filters.type && log.type !== filters.type) return false;
        return true;
    };

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                page: currentPage,
                limit: 50,
            };

            if (filters.stream_id) params.stream_id = filters.stream_id;
            if (filters.type) params.type = filters.type;

            const response = await getLogs(params);
            setLogs(response.logs);
            setTotalPages(Math.ceil(response.total / response.limit));
            setHasNext(response.offset + response.limit < response.total);
            setHasPrev(response.offset > 0);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStreams = async () => {
        try {
            const data = await getStreams();
            setStreams(data);
        } catch (error) {
            console.error('Failed to load streams', error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const clearFilters = () => {
        setFilters({ stream_id: '', type: '' });
        setCurrentPage(1);
    };

    const hasActiveFilters = filters.stream_id || filters.type;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            default: return <Activity className="w-5 h-5 text-blue-400" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'just now';
        }
    };

    return (
        <PageContainer title="System Logs">
            <Card className="p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Terminal className="w-4 h-4" />
                            <span>Live Stream</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: <span className="font-medium text-white">{total}</span> logs
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showFilters || hasActiveFilters
                            ? 'bg-primary/10 border border-primary/20 text-primary'
                            : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="p-6 border-b border-white/[0.05] bg-white/[0.01]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Stream</label>
                                <select
                                    value={filters.stream_id}
                                    onChange={(e) => handleFilterChange('stream_id', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                                >
                                    <option value="" className="bg-gray-900">All Streams</option>
                                    {streams.map((stream) => (
                                        <option key={stream.id} value={stream.id} className="bg-gray-900">
                                            {stream.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                                >
                                    <option value="" className="bg-gray-900">All Types</option>
                                    <option value="info" className="bg-gray-900">Info</option>
                                    <option value="success" className="bg-gray-900">Success</option>
                                    <option value="warning" className="bg-gray-900">Warning</option>
                                    <option value="error" className="bg-gray-900">Error</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    disabled={!hasActiveFilters}
                                    className="w-full px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logs List */}
                <div className="divide-y divide-white/[0.05]">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No logs found</p>
                            <p className="text-sm mt-1">
                                {hasActiveFilters ? 'Try adjusting your filters' : 'Waiting for logs...'}
                            </p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="group flex items-start gap-4 p-6 hover:bg-white/[0.02] transition-all cursor-default">
                                <div className={`mt-1 p-2 rounded-xl border ${getBgColor(log.type)}`}>
                                    {getIcon(log.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-white group-hover:text-primary transition-colors">
                                            {log.stream?.name || log.stream_id}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(log.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2 font-mono">{log.message}</p>
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-xs font-mono text-gray-500 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                            {JSON.stringify(log.metadata)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && logs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasNext={hasNext}
                        hasPrev={hasPrev}
                        onPageChange={setCurrentPage}
                    />
                )}
            </Card>
        </PageContainer>
    );
}
