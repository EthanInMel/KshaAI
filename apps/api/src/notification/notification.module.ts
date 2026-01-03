import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from './notification.service';
import { NotificationChannelService } from './notification-channel.service';
import { NotificationChannelController } from './notification-channel.controller';
import { TelegramChannel } from './channels/telegram.channel';
import { DiscordChannel } from './channels/discord.channel';
import { SlackChannel } from './channels/slack.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, PrismaModule, AuthModule],
  controllers: [NotificationChannelController],
  providers: [
    NotificationService,
    NotificationChannelService,
    TelegramChannel,
    DiscordChannel,
    SlackChannel,
    WebhookChannel,
  ],
  exports: [NotificationService, NotificationChannelService],
})
export class NotificationModule { }
