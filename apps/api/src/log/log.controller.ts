import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('log')
export class LogController {
    constructor(private readonly logService: LogService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('stream_id') streamId?: string,
        @Query('type') type?: string,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '50', 10);

        return this.logService.findAll({
            page: pageNum,
            limit: limitNum,
            streamId,
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
}
