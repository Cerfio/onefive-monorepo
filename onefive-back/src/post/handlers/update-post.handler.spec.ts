import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePostHandler } from './update-post.handler';
import { PostService } from '../post.service';
import { ProfileService } from '../../profile/profile.service';
import { StorageService } from '../../storage/storage.service';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('UpdatePostHandler', () => {
  let handler: UpdatePostHandler;

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
          useValue: { update: jest.fn(), get: jest.fn() },
        },
        {
          provide: ProfileService,
          useValue: { get: jest.fn() },
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
          useValue: {},
        },
        UpdatePostHandler,
      ],
    }).compile();

    handler = module.get<UpdatePostHandler>(UpdatePostHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should have execute method', () => {
    expect(handler.execute).toBeDefined();
    expect(typeof handler.execute).toBe('function');
  });
});
