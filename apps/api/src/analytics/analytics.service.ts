import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get overview statistics
     */
    async getOverview() {
        const days = 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Basic stats
        const [
            totalSources,
            totalStreams,
            activeStreams,
            totalContent,
            todayContent,
            totalLlmOutputs,
            todayLlmCalls,
            // totalBacktests,
        ] = await Promise.all([
            this.prisma.source.count(),
            this.prisma.stream.count(),
            this.prisma.stream.count({ where: { status: 'active' } }),
            this.prisma.content.count(),
            this.prisma.content.count({ where: { created_at: { gte: today } } }),
            this.prisma.llmOutput.count(),
            this.prisma.llmOutput.count({ where: { created_at: { gte: today } } }),
            // this.prisma.backtest.count(),
        ]);

        const totalBacktests = 0;

        // Content by day
        const rawContentTrend = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM contents 
            WHERE created_at >= ${startDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const contentByDay = rawContentTrend.map(r => ({
            date: r.date.toISOString().split('T')[0],
            count: Number(r.count)
        }));

        // Content by source type
        const rawSourceStats = await this.prisma.source.groupBy({
            by: ['type'],
            _count: true,
        });
        const contentBySource = rawSourceStats.map(s => ({
            sourceType: s.type,
            count: s._count
        }));

        // Recent activity (Last 10 logs)
        const recentLogs = await this.prisma.log.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: { stream: { select: { name: true } } }
        });
        const recentActivity = recentLogs.map(log => ({
            type: log.type,
            message: log.message,
            timestamp: log.created_at.toISOString(),
            streamName: log.stream?.name
        }));

        // Return combined structure matching frontend expectations (mostly)
        // Frontend expects camelCase in DataOverview interface but simple getDashboardStats uses activeStreams etc.
        // We will return a mix to satisfy both, or let api.ts handle mapping.
        // But api.ts getDataOverview expects camelCase.

        return {
            // Check api.ts DataOverview interface:
            totalContent,
            totalSources,
            activeStreams,
            contentByDay,
            contentBySource,
            recentActivity,

            // Extra fields for DashboardStats
            totalStreams,
            todayContent,
            todayLlmCalls,
            totalBacktests,

            // Snake case for compatibility if needed (api.ts getDashboardStats reads snake_case)
            total_streams: totalStreams,
            active_streams: activeStreams,
            total_sources: totalSources,
            total_contents: totalContent,
            today_content: todayContent,
            today_llm_calls: todayLlmCalls,
        };
    }

    /**
     * Get content trend over the last N days
     */
    async getContentTrend(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const contents = await this.prisma.content.groupBy({
            by: ['created_at'],
            where: {
                created_at: {
                    gte: startDate,
                },
            },
            _count: true,
        });

        // Group by date
        const dateMap = new Map<string, number>();

        // Initialize all dates with 0
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dateMap.set(dateStr, 0);
        }

        // Aggregate counts
        const rawContents = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM contents 
            WHERE created_at >= ${startDate}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `;

        for (const row of rawContents) {
            const dateStr = row.date.toISOString().split('T')[0];
            dateMap.set(dateStr, Number(row.count));
        }

        return Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get LLM usage statistics
     */
    async getLlmStats() {
        const byModel = await this.prisma.llmOutput.groupBy({
            by: ['model'],
            _count: true,
        });

        const byStream = await this.prisma.llmOutput.groupBy({
            by: ['stream_id'],
            _count: true,
        });

        // Get stream names
        const streamIds = byStream.map(s => s.stream_id);
        const streams = await this.prisma.stream.findMany({
            where: { id: { in: streamIds } },
            select: { id: true, name: true },
        });
        const streamNameMap = new Map(streams.map(s => [s.id, s.name]));

        return {
            by_model: Object.fromEntries(
                byModel.map(m => [m.model || 'unknown', m._count])
            ),
            by_stream: Object.fromEntries(
                byStream.map(s => [streamNameMap.get(s.stream_id) || s.stream_id, s._count])
            ),
            total: byModel.reduce((sum, m) => sum + m._count, 0),
        };
    }

    /**
     * Get source statistics by type
     */
    async getSourceStats() {
        const byType = await this.prisma.source.groupBy({
            by: ['type'],
            _count: true,
        });

        const sourceStats = await Promise.all(
            byType.map(async (typeGroup) => {
                const sources = await this.prisma.source.findMany({
                    where: { type: typeGroup.type },
                    select: { id: true },
                });
                const sourceIds = sources.map(s => s.id);

                const contentCount = await this.prisma.content.count({
                    where: { source_id: { in: sourceIds } },
                });

                return {
                    type: typeGroup.type,
                    count: typeGroup._count,
                    contents: contentCount,
                };
            })
        );

        return {
            total: byType.reduce((sum, t) => sum + t._count, 0),
            by_type: Object.fromEntries(
                sourceStats.map(s => [s.type, { count: s.count, contents: s.contents }])
            ),
        };
    }

    /**
     * Get stream activity statistics
     */
    async getStreamActivity() {
        const streams = await this.prisma.stream.findMany({
            include: {
                _count: {
                    select: {
                        logs: true,
                        llm_outputs: true,
                        backtests: true,
                    },
                },
                source: {
                    select: {
                        type: true,
                        identifier: true,
                    },
                },
            },
            orderBy: {
                updated_at: 'desc',
            },
            take: 10,
        });

        return streams.map(stream => ({
            id: stream.id,
            name: stream.name,
            status: stream.status,
            source_type: stream.source.type,
            source_identifier: stream.source.identifier,
            logs_count: stream._count.logs,
            llm_outputs_count: stream._count.llm_outputs,
            backtests_count: stream._count.backtests,
            updated_at: stream.updated_at,
        }));
    }

    /**
     * Get notification history stats
     */
    async getNotificationStats() {
        const stats = await this.prisma.notificationHistory.groupBy({
            by: ['status', 'channel'],
            _count: true,
        });

        const byChannel: Record<string, { sent: number; failed: number }> = {};
        let totalSent = 0;
        let totalFailed = 0;

        for (const stat of stats) {
            if (!byChannel[stat.channel]) {
                byChannel[stat.channel] = { sent: 0, failed: 0 };
            }

            if (stat.status === 'sent') {
                byChannel[stat.channel].sent += stat._count;
                totalSent += stat._count;
            } else if (stat.status === 'failed') {
                byChannel[stat.channel].failed += stat._count;
                totalFailed += stat._count;
            }
        }

        return {
            total_sent: totalSent,
            total_failed: totalFailed,
            success_rate: totalSent + totalFailed > 0
                ? (totalSent / (totalSent + totalFailed) * 100).toFixed(2) + '%'
                : 'N/A',
            by_channel: byChannel,
        };
    }
}
