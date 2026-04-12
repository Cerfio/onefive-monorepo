import { Test, TestingModule } from '@nestjs/testing';
import { SmsConfirmHandler } from './sms-confirm.handler';
import { SmsVerificationService } from '../sms-verification.service';
import { UsersService } from '../../users/users.service';
import {
  SmsVerificationNotFoundException,
  SmsVerificationCodeExpiredException,
  SmsVerificationIncorrectCodeException,
  SmsVerificationPhoneNumberAlreadyUsedException,
} from '../sms-verification.exception';
import { AuthenticationNotFoundException } from '../../auth/auth.exception';

describe('SmsConfirmHandler', () => {
  let handler: SmsConfirmHandler;
  let usersService: jest.Mocked<UsersService>;
  let smsVerificationService: jest.Mocked<SmsVerificationService>;

  const mockTransactionId = 'test-transaction-id';
  const mockUserId = 'user-id-123';
  const mockCode = '123456';
  const mockPhoneNumber = '+33612345678';

  beforeEach(async () => {
    const mockUsersService = {
      get: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockSmsVerificationService = {
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsConfirmHandler,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: SmsVerificationService,
          useValue: mockSmsVerificationService,
        },
        { provide: 'Logger', useValue: { warn: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    handler = module.get<SmsConfirmHandler>(SmsConfirmHandler);
    usersService = module.get(UsersService);
    smsVerificationService = module.get(SmsVerificationService);
  });

  describe('execute', () => {
    it('should return success with alreadyVerified when phone is already verified', async () => {
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: mockPhoneNumber,
      } as any);

      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });

      expect(result).toEqual({
        success: true,
        alreadyVerified: true,
        message: 'Phone number already verified',
        phoneNumber: mockPhoneNumber,
      });
      expect(smsVerificationService.findMany).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationNotFoundException when user not found', async () => {
      usersService.get.mockResolvedValue(null);

      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(AuthenticationNotFoundException);
    });

    it('should throw SmsVerificationNotFoundException when no verification exists', async () => {
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: null,
      } as any);
      smsVerificationService.findMany.mockResolvedValue([]);

      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(SmsVerificationNotFoundException);
    });

    it('should throw SmsVerificationCodeExpiredException when code expired', async () => {
      const expiredDate = new Date(Date.now() - 60000);
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: null,
      } as any);
      smsVerificationService.findMany.mockResolvedValue([
        {
          smsCode: mockCode,
          phoneNumber: mockPhoneNumber,
          codeExpiresAt: expiredDate,
        } as any,
      ]);

      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(SmsVerificationCodeExpiredException);
    });

    it('should throw SmsVerificationIncorrectCodeException when code is wrong', async () => {
      const futureDate = new Date(Date.now() + 60000);
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: null,
      } as any);
      smsVerificationService.findMany.mockResolvedValue([
        {
          smsCode: '654321',
          phoneNumber: mockPhoneNumber,
          codeExpiresAt: futureDate,
        } as any,
      ]);
      usersService.findOne.mockResolvedValue(null);

      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(SmsVerificationIncorrectCodeException);
    });

    it('should throw SmsVerificationPhoneNumberAlreadyUsedException when phone used by another user', async () => {
      const futureDate = new Date(Date.now() + 60000);
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: null,
      } as any);
      smsVerificationService.findMany.mockResolvedValue([
        {
          smsCode: mockCode,
          phoneNumber: mockPhoneNumber,
          codeExpiresAt: futureDate,
        } as any,
      ]);
      usersService.findOne.mockResolvedValue({
        id: 'other-user-id',
        phoneNumber: mockPhoneNumber,
      } as any);

      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(SmsVerificationPhoneNumberAlreadyUsedException);
    });

    it('should verify code and update user phone number successfully', async () => {
      const futureDate = new Date(Date.now() + 60000);
      usersService.get.mockResolvedValue({
        id: mockUserId,
        phoneNumber: null,
      } as any);
      smsVerificationService.findMany.mockResolvedValue([
        {
          smsCode: mockCode,
          phoneNumber: mockPhoneNumber,
          codeExpiresAt: futureDate,
        } as any,
      ]);
      usersService.findOne.mockResolvedValue(null);
      usersService.update.mockResolvedValue({} as any);

      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });

      expect(result).toEqual({
        success: true,
        message: 'Numéro de téléphone vérifié avec succès',
        phoneNumber: mockPhoneNumber,
      });
      expect(usersService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockUserId },
        data: { phoneNumber: mockPhoneNumber },
      });
    });
  });
});
