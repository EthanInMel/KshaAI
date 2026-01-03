import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { WebSocketSourceController } from './websocket-source.controller';
import { AdapterManagerService } from './adapter-manager.service';
import { XAdapter } from './adapters/x-official.adapter';
import { RssAdapter } from './adapters/rss.adapter';
import { NewsNowAdapter } from './adapters/newsnow.adapter';
import { BlueskyAdapter } from './adapters/bluesky.adapter';
import { MastodonAdapter } from './adapters/mastodon.adapter';
import { GitHubAdapter } from './adapters/github.adapter';
// Helper adapters (not for polling, but for configuration/validation)
import { TelegramAdapter } from './adapters/telegram.adapter';
import { DiscordAdapter } from './adapters/discord.adapter';
import { RedditAdapter } from './adapters/reddit.adapter';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, HttpModule, AuthModule],
  controllers: [SourceController, WebSocketSourceController],
  providers: [
    SourceService,
    AdapterManagerService,
    // Polling adapters (implement SourceAdapter)
    XAdapter,
    RssAdapter,
    NewsNowAdapter,
    BlueskyAdapter,
    MastodonAdapter,
    GitHubAdapter,
    // Helper adapters (for validation/configuration)
    TelegramAdapter,
    DiscordAdapter,
    RedditAdapter,
  ],
  exports: [SourceService, AdapterManagerService, TelegramAdapter, DiscordAdapter, RedditAdapter],
})
export class SourceModule { }
