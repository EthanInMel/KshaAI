import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StreamModule } from '../stream/stream.module';

@Module({
    imports: [PrismaModule, StreamModule],
    controllers: [BacktestController],
    providers: [BacktestService],
    exports: [BacktestService],
})
export class BacktestModule { }
