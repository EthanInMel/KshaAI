import { Test, TestingModule } from '@nestjs/testing';
import { SourceService } from './source.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SourceService', () => {
  let service: SourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceService,
        {
          provide: PrismaService,
          useValue: {
            source: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            content: {
              count: jest.fn(),
            },
            stream: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SourceService>(SourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
