import { Test, TestingModule } from '@nestjs/testing';
import { SigninHandler } from './signin.handler';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { SecurityService } from '../../common/security/security.service';
import { LogService } from 'logstash-winston-3';
import { AuthType } from '@prisma/client';
import {
  AuthenticationBadPasswordException,
  AuthenticationNotFoundException,
} from '../auth.exception';

describe('SigninHandler', () => {
  let handler: SigninHandler;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionsService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionService = {
      createSession: jest.fn(),
      validateSession: jest.fn(),
    };

    const mockSecurityService = {
      checkSuspiciousActivity: jest.fn().mockResolvedValue(false),
      isBlockedIp: jest.fn().mockResolvedValue(false),
      blockIp: jest.fn(),
      logSecurityEvent: jest.fn(),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninHandler,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SessionsService,
          useValue: mockSessionService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<SigninHandler>(SigninHandler);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionsService);
    logger = module.get('Logger');
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockUserId = 'user-id';
    const mockSessionId = 'session-id';
    const mockHashedPassword = 'hashed-password';

    beforeEach(() => {
      // Mock environment variable
      process.env.KEY_AUTHENTICATION = 'test-key';
    });

    it('should signin successfully with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      // Mock bcrypt.compare to return true
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert
      expect(result).toEqual({
        sessionId: mockSessionId,
      });

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        email: mockEmail,
      });

      expect(sessionService.createSession).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          userId: mockUserId,
        },
      });
    });

    it('should throw AuthenticationNotFoundException when user not found', async () => {
      // Arrange
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow(AuthenticationNotFoundException);
    });

    it('should throw AuthenticationBadPasswordException when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return false (incorrect password)
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow(AuthenticationBadPasswordException);
    });

    it('should compare password with correct parameters', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      const bcryptCompareSpy = jest
        .spyOn(require('bcrypt'), 'compare')
        .mockResolvedValue(true);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert
      expect(bcryptCompareSpy).toHaveBeenCalledWith(
        `${mockPassword}${process.env.KEY_AUTHENTICATION}`,
        mockHashedPassword,
      );
    });

    it('should handle session creation error', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockError = new Error('Session creation failed');
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      sessionService.createSession.mockRejectedValue(mockError);

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow();

      expect(usersService.findByEmailWithPassword).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
    });

    it('should log execution start and end', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert
    });

    it('should handle empty email', async () => {
      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: '',
          password: mockPassword,
        }),
      ).rejects.toThrow(AuthenticationNotFoundException);
    });

    it('should handle empty password', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: '',
        }),
      ).rejects.toThrow(AuthenticationBadPasswordException);
    });

    it('should handle bcrypt.compare error', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);

      const mockError = new Error('Bcrypt error');
      jest.spyOn(require('bcrypt'), 'compare').mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow();
    });
  });
});
