import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { TelegramChannel } from './channels/telegram.channel';
import { DiscordChannel } from './channels/discord.channel';
import { SlackChannel } from './channels/slack.channel';
import { WebhookChannel } from './channels/webhook.channel';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: TelegramChannel,
          useValue: {
            channel: 'telegram',
            isReady: jest.fn(() => true),
            send: jest.fn(),
          },
        },
        {
          provide: DiscordChannel,
          useValue: {
            channel: 'discord',
            isReady: jest.fn(() => true),
            send: jest.fn(),
          },
        },
        {
          provide: SlackChannel,
          useValue: {
            channel: 'slack',
            isReady: jest.fn(() => true),
            send: jest.fn(),
          },
        },
        {
          provide: WebhookChannel,
          useValue: {
            channel: 'webhook',
            isReady: jest.fn(() => true),
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
