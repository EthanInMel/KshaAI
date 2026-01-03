import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreamProcessorService } from '../stream/stream-processor.service';
import { CreateBacktestDto } from './dto/create-backtest.dto';
import { BacktestStatus } from '@prisma/client';

@Injectable()
export class BacktestService {
    private readonly logger = new Logger(BacktestService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly streamProcessor: StreamProcessorService,
    ) { }

    async create(dto: CreateBacktestDto) {
        // Validate stream exists
        const stream = await this.prisma.stream.findUnique({
            where: { id: dto.streamId },
            include: { source: true },
        });

        if (!stream) {
            throw new NotFoundException('Stream not found');
        }

        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);

        if (startTime >= endTime) {
            throw new BadRequestException('Start time must be before end time');
        }

        // Count contents in date range
        const totalItems = await this.prisma.content.count({
            where: {
                source_id: stream.source_id,
                created_at: {
                    gte: startTime,
                    lte: endTime,
                },
            },
        });

        if (totalItems === 0) {
            throw new BadRequestException('No content found in the specified date range');
        }

        // Create backtest
        const backtest = await this.prisma.backtest.create({
            data: {
                stream_id: dto.streamId,
                name: dto.name,
                description: dto.description,
                range_start: startTime,
                range_end: endTime,
                config: dto.config,
                total_items: totalItems,
                status: BacktestStatus.PENDING,
            },
        });

        return backtest;
    }

    async findAll() {
        return this.prisma.backtest.findMany({
            include: {
                stream: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const backtest = await this.prisma.backtest.findUnique({
            where: { id },
            include: {
                stream: {
                    include: {
                        source: true,
                    },
                },
            },
        });

        if (!backtest) {
            throw new NotFoundException('Backtest not found');
        }

        return backtest;
    }

    async findByStream(streamId: string) {
        return this.prisma.backtest.findMany({
            where: { stream_id: streamId },
            orderBy: { created_at: 'desc' },
        });
    }

    async getResults(id: string, page = 1, limit = 50) {
        const backtest = await this.findOne(id);

        const [results, total] = await Promise.all([
            this.prisma.backtestResult.findMany({
                where: { backtest_id: id },
                include: {
                    content: {
                        select: {
                            id: true,
                            external_id: true,
                            raw_content: true,
                            created_at: true,
                        },
                    },
                },
                orderBy: { created_at: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.backtestResult.count({
                where: { backtest_id: id },
            }),
        ]);

        return { data: results, total, page, limit };
    }

    async run(id: string) {
        const backtest = await this.findOne(id);

        if (backtest.status === BacktestStatus.RUNNING) {
            throw new BadRequestException('Backtest is already running');
        }

        if (backtest.status === BacktestStatus.COMPLETED) {
            throw new BadRequestException('Backtest has already completed');
        }

        // Update status to running
        await this.prisma.backtest.update({
            where: { id },
            data: {
                status: BacktestStatus.RUNNING,
                started_at: new Date(),
            },
        });

        // Run backtest in background
        this.executeBacktest(id).catch((error) => {
            this.logger.error(`Backtest ${id} failed: ${error.message}`);
            this.prisma.backtest.update({
                where: { id },
                data: { status: BacktestStatus.FAILED },
            });
        });

        return { message: 'Backtest started', id };
    }

    private async executeBacktest(backtestId: string) {
        const backtest = await this.findOne(backtestId);
        const stream = backtest.stream;

        // Get contents in date range
        const contents = await this.prisma.content.findMany({
            where: {
                source_id: stream.source_id,
                created_at: {
                    gte: backtest.range_start ?? undefined,
                    lte: backtest.range_end ?? undefined,
                },
            },
            orderBy: { created_at: 'asc' },
        });

        let processedItems = 0;

        for (const content of contents) {
            const startTime = Date.now();

            try {
                // Process content through stream
                const result = await this.streamProcessor.processContentForBacktest(
                    content,
                    stream,
                    backtestId
                );

                // Save result
                await this.prisma.backtestResult.create({
                    data: {
                        backtest_id: backtestId,
                        content_id: content.id,
                        status: 'SUCCESS',
                        output: result as any,
                        execution_time_ms: Date.now() - startTime,
                    },
                });
            } catch (error: any) {
                await this.prisma.backtestResult.create({
                    data: {
                        backtest_id: backtestId,
                        content_id: content.id,
                        status: 'FAILURE',
                        error_message: error.message,
                        execution_time_ms: Date.now() - startTime,
                    },
                });
            }

            processedItems++;

            // Update progress every 10 items
            if (processedItems % 10 === 0) {
                await this.prisma.backtest.update({
                    where: { id: backtestId },
                    data: { processed_items: processedItems },
                });
            }
        }

        // Mark as completed
        await this.prisma.backtest.update({
            where: { id: backtestId },
            data: {
                status: BacktestStatus.COMPLETED,
                completed_at: new Date(),
                processed_items: processedItems,
            },
        });

        this.logger.log(`Backtest ${backtestId} completed: ${processedItems}/${contents.length} items`);
    }

    async delete(id: string) {
        await this.findOne(id);
        await this.prisma.backtest.delete({ where: { id } });
        return { message: 'Backtest deleted' };
    }
}
