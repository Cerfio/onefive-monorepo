import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileHandler } from './create-profile.handler';
import { ProfileService } from '../profile.service';
import { WaitlistService } from '../../waitlist/waitlist.service';
import { UsersService } from '../../users/users.service';
import { LogService } from 'logstash-winston-3';

describe('CreateProfileHandler', () => {
  let handler: CreateProfileHandler;
  let profileService: jest.Mocked<ProfileService>;

  beforeEach(async () => {
    const mockProfileService = {
      create: jest.fn(),
      get: jest.fn(),
    };

    const mockWaitlistService = {
      processNewProfile: jest.fn().mockResolvedValue(undefined),
      getWaitlistStatus: jest.fn(),
    };

    const mockUsersService = {
      get: jest
        .fn()
        .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProfileHandler,
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: WaitlistService,
          useValue: mockWaitlistService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<CreateProfileHandler>(CreateProfileHandler);
    profileService = module.get(ProfileService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create profile successfully', async () => {
    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
    };

    profileService.create.mockResolvedValue(mockProfile as any);

    const result = await handler.execute({
      transactionId: 'tx-123',
      userId: 'user-123',
      city: 'Paris',
      countryCode: 'FR',
      dateOfBirth: '1990-01-01',
      firstName: 'John',
      lastName: 'Doe',
      followProfileIds: [],
      followStartupIds: [],
      gender: 'male',
      genderSalutationPreference: 'MALE' as any,
      tagFollowing: [],
      code: 'FR',
    });

    expect(result).toBeDefined();
    expect(profileService.create).toHaveBeenCalled();
  });
});
