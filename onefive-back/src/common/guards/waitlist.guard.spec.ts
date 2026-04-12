import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WaitlistGuard } from './waitlist.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ALLOW_WAITLIST_NOT_ACTIVE_KEY } from '../decorators/allow-waitlist-not-active.decorator';
import { SKIP_WAITLIST_CHECK_KEY } from '../decorators/skip-waitlist-check.decorator';

describe('WaitlistGuard', () => {
  let guard: WaitlistGuard;
  let prisma: jest.Mocked<PrismaService>;
  let reflector: jest.Mocked<Reflector>;
  let mockGetRequest: jest.Mock;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const mockPrisma = {
      profile: {
        findUnique: jest.fn(),
      },
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistGuard,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<WaitlistGuard>(WaitlistGuard);
    prisma = module.get(PrismaService);
    reflector = module.get(Reflector);

    mockGetRequest = jest.fn();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: mockGetRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access when route is @Public()', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(true); // isPublic = true

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should allow access when @AllowWaitlistNotActive() is set', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic = false
        .mockReturnValueOnce(true); // allowWaitlistNotActive = true

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should use cached profile from request when available', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      mockGetRequest.mockReturnValue({
        userId: 'user-789',
        _profile: { waitlistStatus: 'ACTIVE' },
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should allow access when no userId (not authenticated)', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockGetRequest.mockReturnValue({});

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should allow access when profile does not exist yet', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockGetRequest.mockReturnValue({ userId: 'user-123' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { waitlistStatus: true },
      });
    });

    it('should allow access when waitlistStatus is ACTIVE', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockGetRequest.mockReturnValue({ userId: 'user-123' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        waitlistStatus: 'ACTIVE',
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when waitlistStatus is WAITING', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockGetRequest.mockReturnValue({ userId: 'user-123' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        waitlistStatus: 'WAITING',
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Your account is on the waitlist. Access will be granted once you are approved.',
      );
    });

    it('should query profile with correct userId and select', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockGetRequest.mockReturnValue({ userId: 'user-456' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        waitlistStatus: 'ACTIVE',
      });

      await guard.canActivate(mockExecutionContext);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-456' },
        select: { waitlistStatus: true },
      });
    });

    it('should check isPublic metadata first, then skipWaitlist', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(false); // skipWaitlist
      mockGetRequest.mockReturnValue({ userId: 'user-123' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        waitlistStatus: 'ACTIVE',
      });

      await guard.canActivate(mockExecutionContext);

      // First call checks isPublic, second allowWaitlist, third backward compat skipWaitlist
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(3);
      expect(reflector.getAllAndOverride).toHaveBeenNthCalledWith(
        1,
        'isPublic',
        expect.any(Array),
      );
      expect(reflector.getAllAndOverride).toHaveBeenNthCalledWith(
        2,
        ALLOW_WAITLIST_NOT_ACTIVE_KEY,
        expect.any(Array),
      );
      expect(reflector.getAllAndOverride).toHaveBeenNthCalledWith(
        3,
        SKIP_WAITLIST_CHECK_KEY,
        expect.any(Array),
      );
    });
  });
});
