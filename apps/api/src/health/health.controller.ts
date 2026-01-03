import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async check() {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                database: 'unknown',
                api: 'ok',
            },
        };

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            health.services.database = 'up';
        } catch (error) {
            health.services.database = 'down';
            health.status = 'error';
        }

        return health;
    }
}
