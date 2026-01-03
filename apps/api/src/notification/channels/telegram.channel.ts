import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NotificationChannel, NotificationMessage } from '../../core';

@Injectable()
export class TelegramChannel implements NotificationChannel {
    private readonly logger = new Logger(TelegramChannel.name);
    private readonly botToken: string;
    public readonly channel = 'telegram';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
        if (!this.botToken) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not set');
        }
    }

    isReady(): boolean {
        return !!this.botToken;
    }

    async send(
        recipient: string, // Chat ID
        message: NotificationMessage,
        config?: Record<string, any>
    ): Promise<boolean> {
        const token = config?.telegram_bot_token || this.botToken;
        const chatId = recipient || config?.telegram_chat_id;

        if (!token) {
            this.logger.error('Telegram bot token not configured');
            return false;
        }

        if (!chatId) {
            this.logger.error('Telegram chat ID not provided');
            return false;
        }

        try {
            const text = this.formatMessage(message);
            const url = `https://api.telegram.org/bot${token}/sendMessage`;

            await firstValueFrom(
                this.httpService.post(url, {
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                    disable_web_page_preview: config?.disablePreview || false,
                })
            );

            return true;
        } catch (error) {
            this.logger.error(`Telegram send error: ${error.message}`);
            return false;
        }
    }

    private formatMessage(message: NotificationMessage): string {
        let text = '';

        if (message.title) {
            text += `<b>${message.title}</b>\n\n`;
        }

        text += message.content;

        if (message.url) {
            text += `\n\n<a href="${message.url}">View Source</a>`;
        }

        return text;
    }
}
