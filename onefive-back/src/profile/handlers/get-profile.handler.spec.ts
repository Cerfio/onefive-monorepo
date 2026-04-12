import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileHandler } from './get-profile.handler';
import { ProfileService } from '../profile.service';
import { StreakService } from '../../streak/streak.service';
import { StorageService } from '../../storage/storage.service';
import { ProfileRelationshipsService } from '../../profile-relationships/profile-relationships.service';
import { FollowsService } from '../../follows/follows.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('GetProfileHandler', () => {
  let handler: GetProfileHandler;

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
          provide: ProfileService,
          useValue: { get: jest.fn() },
        },
        {
          provide: StreakService,
          useValue: { getCurrentStreak: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { getSignedUrl: jest.fn() },
        },
        {
          provide: ProfileRelationshipsService,
          useValue: { getUserRelationships: jest.fn() },
        },
        {
          provide: FollowsService,
          useValue: { isFollowingProfile: jest.fn() },
        },
        {
          provide: NotificationHelperService,
          useValue: { send: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        GetProfileHandler,
      ],
    }).compile();

    handler = module.get<GetProfileHandler>(GetProfileHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should have execute method', () => {
    expect(handler.execute).toBeDefined();
    expect(typeof handler.execute).toBe('function');
  });
});
