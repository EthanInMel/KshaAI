import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllOptions {
    page: number;
    limit: number;
    streamId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
}

@Injectable()
export class LogService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(options: FindAllOptions) {
        const { page, limit, streamId, type, startDate, endDate } = options;

        // Build where clause
        const where: any = {};

        if (streamId) {
            where.stream_id = streamId;
        }

        if (type) {
            where.type = type;
        }

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) {
                where.created_at.gte = startDate;
            }
            if (endDate) {
                where.created_at.lte = endDate;
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [logs, total] = await Promise.all([
            this.prisma.log.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
                include: {
                    stream: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.log.count({ where }),
        ]);

        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    }
}
