import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from './stream.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StreamService', () => {
  let service: StreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<StreamService>(StreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
