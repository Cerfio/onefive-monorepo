import { Test, TestingModule } from '@nestjs/testing';
import { GetDiscussionHandler } from './get-discussion.handler';
import { DiscussionService } from '../discussion.service';
import { DiscussionViewService } from '../../discussion-view/discussion-view.service';
import { ProfileService } from '../../profile/profile.service';
import { ProfileFollowService } from '../../profile-follow/profile-follow.service';
import { StorageService } from '../../storage/storage.service';
import { StreakService } from '../../streak/streak.service';
import { LogService } from 'logstash-winston-3';

describe('GetDiscussionHandler', () => {
  let handler: GetDiscussionHandler;

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
          provide: DiscussionService,
          useValue: { get: jest.fn() },
        },
        {
          provide: DiscussionViewService,
          useValue: { create: jest.fn() },
        },
        {
          provide: ProfileService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ProfileFollowService,
          useValue: {
            isFollowing: jest.fn(),
            areFollowingBatch: jest.fn().mockResolvedValue(new Set()),
          },
        },
        {
          provide: StorageService,
          useValue: { getSignedUrl: jest.fn() },
        },
        {
          provide: StreakService,
          useValue: {
            getCurrentStreak: jest.fn(),
            getCurrentStreakBatch: jest.fn().mockResolvedValue(new Map()),
          },
        },
        GetDiscussionHandler,
      ],
    }).compile();

    handler = module.get<GetDiscussionHandler>(GetDiscussionHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should have execute method', () => {
    expect(handler.execute).toBeDefined();
    expect(typeof handler.execute).toBe('function');
  });
});
