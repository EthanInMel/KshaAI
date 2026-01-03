import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('overview')
    getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('content-trend')
    getContentTrend(
        @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    ) {
        return this.analyticsService.getContentTrend(days);
    }

    @Get('llm-stats')
    getLlmStats() {
        return this.analyticsService.getLlmStats();
    }

    @Get('source-stats')
    getSourceStats() {
        return this.analyticsService.getSourceStats();
    }

    @Get('stream-activity')
    getStreamActivity() {
        return this.analyticsService.getStreamActivity();
    }

    @Get('notification-stats')
    getNotificationStats() {
        return this.analyticsService.getNotificationStats();
    }
}
