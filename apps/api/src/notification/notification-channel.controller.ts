import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Headers,
    UnauthorizedException
} from '@nestjs/common';
import { NotificationChannelService, CreateChannelDto, UpdateChannelDto } from './notification-channel.service';
import { AuthService } from '../auth/auth.service';

@Controller('notification-channel')
export class NotificationChannelController {
    constructor(
        private readonly channelService: NotificationChannelService,
        private readonly authService: AuthService,
    ) { }

    private getUserId(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);
        const decoded = this.authService.decodeToken(token);

        if (!decoded) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return decoded.userId;
    }

    @Post()
    async create(@Headers('authorization') authHeader: string, @Body() dto: CreateChannelDto) {
        const userId = this.getUserId(authHeader);
        return this.channelService.create(userId, dto);
    }

    @Get()
    async findAll(@Headers('authorization') authHeader: string) {
        const userId = this.getUserId(authHeader);
        return this.channelService.findAll(userId);
    }

    @Get('defaults')
    async getDefaults(@Headers('authorization') authHeader: string) {
        const userId = this.getUserId(authHeader);
        return this.channelService.getDefaults(userId);
    }

    @Get(':id')
    async findOne(@Headers('authorization') authHeader: string, @Param('id') id: string) {
        const userId = this.getUserId(authHeader);
        return this.channelService.findOne(userId, id);
    }

    @Put(':id')
    async update(@Headers('authorization') authHeader: string, @Param('id') id: string, @Body() dto: UpdateChannelDto) {
        const userId = this.getUserId(authHeader);
        return this.channelService.update(userId, id, dto);
    }

    @Delete(':id')
    async delete(@Headers('authorization') authHeader: string, @Param('id') id: string) {
        const userId = this.getUserId(authHeader);
        return this.channelService.delete(userId, id);
    }
}
