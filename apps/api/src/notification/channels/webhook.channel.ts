import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotificationChannel, NotificationMessage } from '../../core';

@Injectable()
export class WebhookChannel implements NotificationChannel {
    private readonly logger = new Logger(WebhookChannel.name);
    public readonly channel = 'webhook';

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
        const webhookUrl = recipient || config?.generic_webhook_url;

        if (!webhookUrl) {
            this.logger.error('Generic webhook URL not provided');
            return false;
        }

        try {
            await firstValueFrom(this.httpService.post(webhookUrl, {
                ...message,
                timestamp: new Date().toISOString(),
            }));
            return true;
        } catch (error) {
            this.logger.error(`Webhook send error: ${error.message}`);
            return false;
        }
    }
}
