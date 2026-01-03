import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';
import { SourceModule } from '../source/source.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
    imports: [SourceModule, PrismaModule, QueueModule],
    providers: [PollingService],
    exports: [PollingService],
})
export class PollingModule { }
