import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotificationChannel, NotificationMessage } from '../../core';

@Injectable()
export class SlackChannel implements NotificationChannel {
    private readonly logger = new Logger(SlackChannel.name);
    public readonly channel = 'slack';

    constructor(
        private readonly httpService: HttpService,
    ) { }

    isReady(): boolean {
        return true;
    }

    async send(
        recipient: string, // Webhook URL
        message: NotificationMessage,
        config?: Record<string, any>
    ): Promise<boolean> {
        const webhookUrl = recipient || config?.slack_webhook_url;

        if (!webhookUrl) {
            this.logger.error('Slack webhook URL not provided');
            return false;
        }

        try {
            const payload = this.formatMessage(message);
            await firstValueFrom(this.httpService.post(webhookUrl, payload));
            return true;
        } catch (error) {
            this.logger.error(`Slack send error: ${error.message}`);
            return false;
        }
    }

    private formatMessage(message: NotificationMessage): any {
        let text = '';
        if (message.title) text += `*${message.title}*\n\n`;
        text += message.content;
        if (message.url) text += `\n\n<${message.url}|View Source>`;

        return {
            text: text,
            // Simple Slack formatting
        };
    }
}
