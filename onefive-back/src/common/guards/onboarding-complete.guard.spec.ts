import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OnboardingCompleteGuard } from './onboarding-complete.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileOnboardingNotCompletedException } from 'src/profile/profile.exception';

describe('OnboardingCompleteGuard', () => {
  let guard: OnboardingCompleteGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: jest.Mocked<PrismaService>;
  let executionContext: ExecutionContext;
  let getRequest: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingCompleteGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: 'Logger',
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(OnboardingCompleteGuard);
    reflector = module.get(Reflector);
    prisma = module.get(PrismaService);

    getRequest = jest.fn();
    executionContext = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('allows @Public routes', async () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
  });

  it('allows routes with @AllowOnboardingNotComplete', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
  });

  it('blocks when profile is missing', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    getRequest.mockReturnValue({ userId: 'user-1', transactionId: 'tx-1' });
    (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      ProfileOnboardingNotCompletedException,
    );
  });

  it('reuses cached request._profile without second query', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    const request = {
      userId: 'user-1',
      transactionId: 'tx-1',
      _profile: { id: 'profile-1', waitlistStatus: 'ACTIVE' as const },
    };
    getRequest.mockReturnValue(request);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
    expect(prisma.profile.findUnique).not.toHaveBeenCalled();
  });
});
