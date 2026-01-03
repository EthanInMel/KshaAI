import { Test, TestingModule } from '@nestjs/testing';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('StreamController', () => {
  let controller: StreamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
      providers: [
        StreamService,
        {
          provide: PrismaService,
          useValue: {
            stream: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            source: {
              findUnique: jest.fn(),
            },
            log: {
              count: jest.fn(),
            },
            llmOutput: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            decodeToken: jest.fn(() => ({ userId: 'test-user-id' })),
          },
        },
      ],
    }).compile();

    controller = module.get<StreamController>(StreamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
