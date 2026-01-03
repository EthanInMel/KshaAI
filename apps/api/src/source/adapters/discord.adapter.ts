import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DiscordGuild {
    id: string;
    name: string;
    icon?: string;
    owner: boolean;
    permissions: string;
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: number;
    guild_id: string;
    topic?: string;
}

export interface DiscordMessage {
    id: string;
    channel_id: string;
    author: {
        id: string;
        username: string;
        discriminator: string;
        avatar?: string;
    };
    content: string;
    timestamp: string;
    attachments?: any[];
    embeds?: any[];
}

export interface DiscordSourceConfig {
    botToken: string;
    guildId: string;
    channelIds: string[];
    channelNames?: Record<string, string>;
    lastMessageId?: string;
}

export interface DiscordBotInfo {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
}

@Injectable()
export class DiscordAdapter {
    private readonly logger = new Logger(DiscordAdapter.name);
    private readonly DISCORD_API_BASE = 'https://discord.com/api/v10';

    constructor(private readonly httpService: HttpService) { }

    private getHeaders(botToken: string) {
        return {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Validate bot token and get bot info
     */
    async validateBotToken(botToken: string): Promise<DiscordBotInfo> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.DISCORD_API_BASE}/users/@me`, {
                    headers: this.getHeaders(botToken),
                })
            );
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to validate Discord bot token: ${error.message}`);
            throw new BadRequestException('Invalid bot token');
        }
    }

    /**
     * Get guilds (servers) the bot is in
     */
    async getBotGuilds(botToken: string): Promise<DiscordGuild[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.DISCORD_API_BASE}/users/@me/guilds`, {
                    headers: this.getHeaders(botToken),
                })
            );
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get Discord guilds: ${error.message}`);
            throw new BadRequestException('Failed to get guilds');
        }
    }

    /**
     * Get channels in a guild
     */
    async getGuildChannels(botToken: string, guildId: string): Promise<DiscordChannel[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.DISCORD_API_BASE}/guilds/${guildId}/channels`, {
                    headers: this.getHeaders(botToken),
                })
            );
            // Filter to only text channels (type 0)
            return response.data.filter((c: DiscordChannel) => c.type === 0);
        } catch (error: any) {
            this.logger.error(`Failed to get Discord channels: ${error.message}`);
            throw new BadRequestException('Failed to get channels');
        }
    }

    /**
     * Get messages from a channel
     */
    async getChannelMessages(botToken: string, channelId: string, after?: string): Promise<DiscordMessage[]> {
        try {
            const params: any = { limit: 100 };
            if (after) params.after = after;

            const response = await firstValueFrom(
                this.httpService.get(`${this.DISCORD_API_BASE}/channels/${channelId}/messages`, {
                    headers: this.getHeaders(botToken),
                    params,
                })
            );
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to get Discord messages: ${error.message}`);
            return [];
        }
    }

    /**
     * Parse Discord message into standardized format
     */
    parseMessage(message: DiscordMessage, channelName?: string): {
        externalId: string;
        content: string;
        postedAt: Date;
        metadata: any;
    } {
        let contentText = message.content || '';
        if (message.embeds?.length) {
            for (const embed of message.embeds) {
                if (embed.title) contentText += `\n[Embed: ${embed.title}]`;
                if (embed.description) contentText += `\n${embed.description}`;
            }
        }

        return {
            externalId: message.id,
            content: contentText.trim() || '[Attachment]',
            postedAt: new Date(message.timestamp),
            metadata: {
                message_id: message.id,
                channel_id: message.channel_id,
                channel_name: channelName,
                author: message.author,
                has_attachments: !!message.attachments?.length,
                has_embeds: !!message.embeds?.length,
            },
        };
    }

    /**
     * Test bot token and get info
     */
    async testBotToken(botToken: string): Promise<{
        valid: boolean;
        bot?: DiscordBotInfo;
        guilds?: DiscordGuild[];
        error?: string;
    }> {
        try {
            const bot = await this.validateBotToken(botToken);
            const guilds = await this.getBotGuilds(botToken);
            return { valid: true, bot, guilds };
        } catch (error: any) {
            return { valid: false, error: error.message };
        }
    }
}
