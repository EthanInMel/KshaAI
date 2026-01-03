import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotificationChannel, NotificationMessage } from '../../core';

@Injectable()
export class DiscordChannel implements NotificationChannel {
    private readonly logger = new Logger(DiscordChannel.name);
    public readonly channel = 'discord';

    constructor(
        private readonly httpService: HttpService,
    ) { }

    isReady(): boolean {
        return true; // Use config based readiness checking at runtime
    }

    async send(
        recipient: string, // Webhook URL or empty if using global config
        message: NotificationMessage,
        config?: Record<string, any>
    ): Promise<boolean> {
        const webhookUrl = recipient || config?.discord_webhook_url;

        if (!webhookUrl) {
            this.logger.error('Discord webhook URL not provided');
            return false;
        }

        try {
            const payload = this.formatMessage(message);
            await firstValueFrom(this.httpService.post(webhookUrl, payload));
            return true;
        } catch (error) {
            this.logger.error(`Discord send error: ${error.message}`);
            return false;
        }
    }

    private formatMessage(message: NotificationMessage): any {
        const embeds = [{
            title: message.title,
            description: message.content,
            url: message.url,
            color: 5814783, // Discord Blurple
            timestamp: new Date().toISOString(),
            footer: message.metadata?.sourceId ? { text: `Source: ${message.metadata.sourceId}` } : undefined
        }];

        return {
            content: message.title ? `**${message.title}**` : undefined,
            embeds: embeds
        };
    }
}
