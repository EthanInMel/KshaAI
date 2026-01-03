import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { CreateBacktestDto } from './dto/create-backtest.dto';

@Controller('backtest')
export class BacktestController {
    constructor(private readonly backtestService: BacktestService) { }

    @Post()
    create(@Body() dto: CreateBacktestDto) {
        return this.backtestService.create(dto);
    }

    @Get()
    findAll() {
        return this.backtestService.findAll();
    }

    @Get('stream/:streamId')
    findByStream(@Param('streamId') streamId: string) {
        return this.backtestService.findByStream(streamId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.backtestService.findOne(id);
    }

    @Get(':id/results')
    getResults(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    ) {
        return this.backtestService.getResults(id, page, limit);
    }

    @Post(':id/run')
    run(@Param('id') id: string) {
        return this.backtestService.run(id);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.backtestService.delete(id);
    }
}
