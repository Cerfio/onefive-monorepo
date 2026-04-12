import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OtpOnlySessionGuard } from './otp-only-session.guard';
import { OtpOnlySessionRestrictedException } from './otp-only-session.exception';

describe('OtpOnlySessionGuard', () => {
  let guard: OtpOnlySessionGuard;
  let reflector: jest.Mocked<Reflector>;
  let executionContext: ExecutionContext;
  let getRequest: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpOnlySessionGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(OtpOnlySessionGuard);
    reflector = module.get(Reflector);

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

  it('allows routes with @AllowOtpOnlySession', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
  });

  it('blocks otp-only sessions on non-allowed routes', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    getRequest.mockReturnValue({
      transactionId: 'tx-otp',
      session: { isOtpOnlySession: true },
    });

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      OtpOnlySessionRestrictedException,
    );
  });

  it('allows normal sessions on non-allowed routes', async () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    getRequest.mockReturnValue({
      session: { isOtpOnlySession: false },
    });

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
  });
});
