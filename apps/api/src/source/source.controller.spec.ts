import { Test, TestingModule } from '@nestjs/testing';
import { SourceController } from './source.controller';
import { SourceService } from './source.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('SourceController', () => {
  let controller: SourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceController],
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
        {
          provide: AuthService,
          useValue: {
            decodeToken: jest.fn(() => ({ userId: 'test-user-id' })),
          },
        },
      ],
    }).compile();

    controller = module.get<SourceController>(SourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
