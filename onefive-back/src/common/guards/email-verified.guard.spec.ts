import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmailVerifiedGuard } from './email-verified.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileEmailNotVerifiedException } from 'src/profile/profile.exception';

describe('EmailVerifiedGuard', () => {
  let guard: EmailVerifiedGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: jest.Mocked<PrismaService>;
  let executionContext: ExecutionContext;
  let getRequest: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerifiedGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
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

    guard = module.get(EmailVerifiedGuard);
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

  it('allows routes with @AllowEmailNotVerified', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
  });

  it('blocks when user is not verified', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    getRequest.mockReturnValue({ userId: 'user-1', transactionId: 'tx-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      isEmailVerified: false,
    });

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      ProfileEmailNotVerifiedException,
    );
  });

  it('reuses cached request._user without second query', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    const request = {
      userId: 'user-1',
      transactionId: 'tx-1',
      _user: { id: 'user-1', isEmailVerified: true },
    };
    getRequest.mockReturnValue(request);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
