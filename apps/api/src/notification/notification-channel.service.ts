import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelType } from '@prisma/client';

export interface CreateChannelDto {
    name: string;
    type: ChannelType;
    config: Record<string, any>;
    is_default?: boolean;
}

export interface UpdateChannelDto {
    name?: string;
    config?: Record<string, any>;
    is_default?: boolean;
}

@Injectable()
export class NotificationChannelService {
    private readonly logger = new Logger(NotificationChannelService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateChannelDto) {
        // If setting as default, unset other defaults of same type
        if (dto.is_default) {
            await this.prisma.notificationChannel.updateMany({
                where: { user_id: userId, type: dto.type, is_default: true },
                data: { is_default: false },
            });
        }

        return this.prisma.notificationChannel.create({
            data: {
                user_id: userId,
                name: dto.name,
                type: dto.type,
                config: dto.config,
                is_default: dto.is_default || false,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notificationChannel.findMany({
            where: { user_id: userId },
            orderBy: [
                { is_default: 'desc' },
                { created_at: 'desc' },
            ],
        });
    }

    async findByType(userId: string, type: ChannelType) {
        return this.prisma.notificationChannel.findMany({
            where: { user_id: userId, type },
            orderBy: { is_default: 'desc' },
        });
    }

    async findOne(userId: string, id: string) {
        const channel = await this.prisma.notificationChannel.findFirst({
            where: { id, user_id: userId },
        });

        if (!channel) {
            throw new NotFoundException(`Channel ${id} not found`);
        }

        return channel;
    }

    async findByIds(userId: string, ids: string[]) {
        return this.prisma.notificationChannel.findMany({
            where: {
                id: { in: ids },
                user_id: userId,
            },
        });
    }

    async update(userId: string, id: string, dto: UpdateChannelDto) {
        const channel = await this.findOne(userId, id);

        // If setting as default, unset other defaults of same type
        if (dto.is_default) {
            await this.prisma.notificationChannel.updateMany({
                where: { user_id: userId, type: channel.type, is_default: true, id: { not: id } },
                data: { is_default: false },
            });
        }

        return this.prisma.notificationChannel.update({
            where: { id },
            data: dto,
        });
    }

    async delete(userId: string, id: string) {
        await this.findOne(userId, id);
        return this.prisma.notificationChannel.delete({
            where: { id },
        });
    }

    async getDefaults(userId: string) {
        return this.prisma.notificationChannel.findMany({
            where: { user_id: userId, is_default: true },
        });
    }
}
