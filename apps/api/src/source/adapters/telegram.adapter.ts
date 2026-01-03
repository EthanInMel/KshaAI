import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface TelegramChat {
    id: number;
    title: string;
    type: 'group' | 'supergroup' | 'channel' | 'private';
    username?: string;
    description?: string;
    member_count?: number;
}

export interface TelegramMessage {
    message_id: number;
    chat: {
        id: number;
        title?: string;
        type: string;
    };
    date: number;
    text?: string;
    caption?: string;
    from?: {
        id: number;
        username?: string;
        first_name?: string;
        last_name?: string;
    };
    forward_from?: any;
    forward_from_chat?: any;
    photo?: any[];
    video?: any;
    document?: any;
}

export interface TelegramSourceConfig {
    botToken: string;
    chatIds: number[];
    chatNames?: Record<number, string>;
    lastUpdateId?: number;
    includeMediaCaptions?: boolean;
}

export interface TelegramBotInfo {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    channel_post?: TelegramMessage;
}

@Injectable()
export class TelegramAdapter {
    private readonly logger = new Logger(TelegramAdapter.name);
    private readonly TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

    constructor(private readonly httpService: HttpService) { }

    /**
     * Validate a bot token and return bot info
     */
    async validateBotToken(botToken: string): Promise<TelegramBotInfo> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.TELEGRAM_API_BASE}${botToken}/getMe`)
            );

            if (!response.data.ok) {
                throw new BadRequestException('Invalid bot token');
            }

            return response.data.result;
        } catch (error: any) {
            this.logger.error(`Failed to validate bot token: ${error.message}`);
            throw new BadRequestException('Invalid bot token or unable to connect to Telegram API');
        }
    }

    /**
     * Get all chats (groups/channels) that the bot is a member of
     */
    async getBotChats(botToken: string): Promise<TelegramChat[]> {
        try {
            await this.validateBotToken(botToken);

            const response = await firstValueFrom(
                this.httpService.get(`${this.TELEGRAM_API_BASE}${botToken}/getUpdates`, {
                    params: {
                        limit: 100,
                        allowed_updates: ['message', 'channel_post']
                    }
                })
            );

            if (!response.data.ok) {
                throw new BadRequestException('Failed to get updates from Telegram');
            }

            const updates = response.data.result || [];
            const chatsMap = new Map<number, TelegramChat>();

            for (const update of updates) {
                const message = update.message || update.channel_post;
                if (message?.chat) {
                    const chat = message.chat;
                    if (['group', 'supergroup', 'channel'].includes(chat.type)) {
                        if (!chatsMap.has(chat.id)) {
                            chatsMap.set(chat.id, {
                                id: chat.id,
                                title: chat.title || `Chat ${chat.id}`,
                                type: chat.type,
                                username: chat.username,
                            });
                        }
                    }
                }
            }

            const chats = Array.from(chatsMap.values());

            // Try to get member count for each chat
            for (const chat of chats) {
                try {
                    const countResponse = await firstValueFrom(
                        this.httpService.get(`${this.TELEGRAM_API_BASE}${botToken}/getChatMemberCount`, {
                            params: { chat_id: chat.id }
                        })
                    );
                    if (countResponse.data.ok) {
                        chat.member_count = countResponse.data.result;
                    }
                } catch {
                    // Ignore error for member count
                }
            }

            return chats;
        } catch (error: any) {
            this.logger.error(`Failed to get bot chats: ${error.message}`);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve Telegram chats');
        }
    }

    /**
     * Get updates from Telegram
     */
    async getUpdates(botToken: string, offset = 0, limit = 100): Promise<TelegramUpdate[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.TELEGRAM_API_BASE}${botToken}/getUpdates`, {
                    params: {
                        offset: offset + 1,
                        limit,
                        allowed_updates: ['message', 'channel_post']
                    }
                })
            );

            if (!response.data.ok) {
                throw new BadRequestException('Failed to get Telegram updates');
            }

            return response.data.result || [];
        } catch (error: any) {
            this.logger.error(`Failed to get Telegram updates: ${error.message}`);
            throw error;
        }
    }

    /**
     * Parse message into standardized format
     */
    parseMessage(message: TelegramMessage, includeMediaCaptions = true): {
        externalId: string;
        content: string;
        postedAt: Date;
        metadata: any;
    } | null {
        const text = message.text || message.caption || '';

        if (!text && !includeMediaCaptions) {
            return null;
        }

        return {
            externalId: `${message.chat.id}_${message.message_id}`,
            content: text || '[Media without caption]',
            postedAt: new Date(message.date * 1000),
            metadata: {
                message_id: message.message_id,
                chat_id: message.chat.id,
                chat_title: message.chat.title,
                chat_type: message.chat.type,
                from: message.from,
                has_photo: !!message.photo,
                has_video: !!message.video,
                has_document: !!message.document,
                forward_from: message.forward_from,
                forward_from_chat: message.forward_from_chat,
            },
        };
    }

    /**
     * Test bot token and get info
     */
    async testBotToken(botToken: string): Promise<{
        valid: boolean;
        bot?: TelegramBotInfo;
        chats?: TelegramChat[];
        error?: string;
    }> {
        try {
            const bot = await this.validateBotToken(botToken);
            const chats = await this.getBotChats(botToken);

            return {
                valid: true,
                bot,
                chats,
            };
        } catch (error: any) {
            return {
                valid: false,
                error: error.message,
            };
        }
    }
}
