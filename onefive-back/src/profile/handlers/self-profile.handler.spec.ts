import { Test, TestingModule } from '@nestjs/testing';
import { SelfProfileHandler } from './self-profile.handler';
import { ProfileService } from '../profile.service';
import { StreakService } from '../../streak/streak.service';
import { StorageService } from '../../storage/storage.service';

describe('SelfProfileHandler', () => {
  let handler: SelfProfileHandler;
  let profileService: jest.Mocked<ProfileService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelfProfileHandler,
        {
          provide: ProfileService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: StreakService,
          useValue: {
            getCurrentStreak: jest.fn().mockResolvedValue(3),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(SelfProfileHandler);
    profileService = module.get(ProfileService);
  });

  it('returns minimal onboarding payload when profile does not exist', async () => {
    profileService.get.mockResolvedValue(null);

    await expect(
      handler.execute({ transactionId: 'tx-1', userId: 'user-1' }),
    ).resolves.toEqual({ needsOnboarding: true });
  });

  it('returns profile payload when profile exists', async () => {
    profileService.get.mockResolvedValue({
      id: 'profile-1',
      firstName: 'John',
      lastName: 'Doe',
      highlight: 'Builder',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      avatar: null,
      cover: null,
      _count: {
        followedBy: 2,
        following: 4,
        posts: 6,
      },
    } as any);

    const result = await handler.execute({
      transactionId: 'tx-2',
      userId: 'user-2',
    });

    expect(result).toMatchObject({
      id: 'profile-1',
      firstName: 'John',
      lastName: 'Doe',
      highlight: 'Builder',
      count: {
        followedBy: 2,
        following: 4,
        posts: 6,
      },
    });
  });
});
