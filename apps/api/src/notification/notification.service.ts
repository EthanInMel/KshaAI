import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationMessage } from '../core';
import { DiscordChannel } from './channels/discord.channel';
import { SlackChannel } from './channels/slack.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { WebhookChannel } from './channels/webhook.channel';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private channels: Map<string, NotificationChannel> = new Map();

    constructor(
        private readonly telegramChannel: TelegramChannel,
        private readonly discordChannel: DiscordChannel,
        private readonly slackChannel: SlackChannel,
        private readonly webhookChannel: WebhookChannel,
    ) {
        this.registerChannel(telegramChannel);
        this.registerChannel(discordChannel);
        this.registerChannel(slackChannel);
        this.registerChannel(webhookChannel);
    }

    private registerChannel(channel: NotificationChannel) {
        if (channel.isReady()) {
            this.channels.set(channel.channel, channel);
            this.logger.log(`Registered notification channel: ${channel.channel}`);
        }
    }

    async send(
        channelName: string,
        recipient: string,
        message: NotificationMessage,
        config?: Record<string, any>
    ): Promise<boolean> {
        const channel = this.channels.get(channelName);
        if (!channel) {
            this.logger.warn(`Notification channel ${channelName} not found or not ready`);
            return false;
        }

        return channel.send(recipient, message, config);
    }

    getAvailableChannels(): string[] {
        return Array.from(this.channels.keys());
    }
}
