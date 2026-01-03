import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { SourceService } from './source.service';

@Controller('websocket-source')
export class WebSocketSourceController {
    constructor(private readonly sourceService: SourceService) { }

    @Get('connections')
    getAllConnections() {
        return this.sourceService.getAllWebSocketConnections();
    }

    @Post(':id/connect')
    connect(@Param('id') id: string, @Body() body: { url: string; config?: any }) {
        return this.sourceService.connectWebSocket(id, body.url, body.config);
    }

    @Delete(':id/disconnect')
    disconnect(@Param('id') id: string) {
        return this.sourceService.disconnectWebSocket(id);
    }

    @Get(':id/status')
    getStatus(@Param('id') id: string) {
        return this.sourceService.getWebSocketStatus(id);
    }
}
