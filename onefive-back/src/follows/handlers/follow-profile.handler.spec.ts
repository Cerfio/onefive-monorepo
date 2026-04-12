import { Test, TestingModule } from '@nestjs/testing';
import { FollowProfileHandler } from './follow-profile.handler';
import { FollowsService } from '../follows.service';
import { ProfileService } from '../../profile/profile.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { LogService } from 'logstash-winston-3';
import { FollowsAlreadyExistsException } from '../follows.exception';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock service
const mockFollowsService = {
  followProfile: jest.fn(),
};

const mockNotificationHelper = {
  sendFollowNotification: jest.fn(),
  sendNotification: jest.fn(),
};

const mockProfileService = {
  get: jest.fn(),
};

describe('FollowProfileHandler', () => {
  let handler: FollowProfileHandler;
  let service: FollowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowProfileHandler,
        {
          provide: FollowsService,
          useValue: mockFollowsService,
        },
        {
          provide: NotificationHelperService,
          useValue: mockNotificationHelper,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<FollowProfileHandler>(FollowProfileHandler);
    service = module.get<FollowsService>(FollowsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockInput = {
      transactionId: 'test-transaction-id',
      userId: 'test-user-id',
      profileId: 'test-profile-id',
    };

    const mockFollowResult = {
      id: 'test-profile-id-test-user-id',
      followingId: 'test-profile-id',
      followedById: 'test-user-id',
      createdAt: new Date(),
    };

    it('should follow profile successfully', async () => {
      mockFollowsService.followProfile.mockResolvedValue(mockFollowResult);

      const result = await handler.execute(mockInput);

      expect(service.followProfile).toHaveBeenCalledWith({
        transactionId: mockInput.transactionId,
        userId: mockInput.userId,
        profileId: mockInput.profileId,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Following profile',
        expect.objectContaining({
          transactionId: mockInput.transactionId,
          userId: mockInput.userId,
          profileId: mockInput.profileId,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Profile followed successfully',
        expect.objectContaining({
          transactionId: mockInput.transactionId,
          userId: mockInput.userId,
          profileId: mockInput.profileId,
          followId: mockFollowResult.id,
        }),
      );

      expect(result).toEqual(mockFollowResult);
    });

    it('should throw FollowsAlreadyExistsException when already following', async () => {
      const error = new FollowsAlreadyExistsException(
        mockLogger as any,
        { transactionId: mockInput.transactionId },
        'Already following this profile',
      );
      mockFollowsService.followProfile.mockRejectedValue(error);

      await expect(handler.execute(mockInput)).rejects.toThrow(
        FollowsAlreadyExistsException,
      );

      expect(service.followProfile).toHaveBeenCalledWith({
        transactionId: mockInput.transactionId,
        userId: mockInput.userId,
        profileId: mockInput.profileId,
      });
    });

    it('should propagate other errors from service', async () => {
      const error = new Error('Database connection failed');
      mockFollowsService.followProfile.mockRejectedValue(error);

      await expect(handler.execute(mockInput)).rejects.toThrow(
        'Database connection failed',
      );

      expect(service.followProfile).toHaveBeenCalledWith({
        transactionId: mockInput.transactionId,
        userId: mockInput.userId,
        profileId: mockInput.profileId,
      });
    });
  });
});
