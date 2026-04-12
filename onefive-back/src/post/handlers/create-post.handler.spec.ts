import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostHandler } from './create-post.handler';
import { PostService } from '../post.service';
import { ProfileService } from '../../profile/profile.service';
import { StreakService } from '../../streak/streak.service';
import { StorageService } from '../../storage/storage.service';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'Logger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          } as unknown as LogService,
        },
        {
          provide: PostService,
          useValue: { create: jest.fn() },
        },
        {
          provide: ProfileService,
          useValue: { get: jest.fn() },
        },
        {
          provide: StreakService,
          useValue: { updateStreak: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { upload: jest.fn() },
        },
        {
          provide: FileProcessingService,
          useValue: { processFiles: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: { profile: { findUnique: jest.fn() } },
        },
        CreatePostHandler,
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should have execute method', () => {
    expect(handler.execute).toBeDefined();
    expect(typeof handler.execute).toBe('function');
  });
});
