// Mock the logger decorator BEFORE importing the handler
jest.mock('../../common/logger/logger.decorator', () =>
  require('../../../test/helpers/mock-log-decorator'),
);

import { Test, TestingModule } from '@nestjs/testing';
import { AuthLinkedinHandler } from './auth-linkedin.handler';
import { LinkedinService } from '../../linkedin/linkedin.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { OAuthStateService } from '../oauth-state/oauth-state.service';
import { ReferralService } from '../../referral/referral.service';
import { LogService } from 'logstash-winston-3';
import { AuthLinkedinHandlerException } from './auth-linkedin.handler.exception';
import { AuthType } from '@prisma/client';

describe('AuthLinkedinHandler', () => {
  let handler: AuthLinkedinHandler;
  let linkedinService: jest.Mocked<LinkedinService>;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let sessionsService: jest.Mocked<SessionsService>;
  let oauthStateService: jest.Mocked<OAuthStateService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockLinkedinService = {
      getAccessToken: jest.fn(),
      getUserInfo: jest.fn(),
    };

    const mockAuthService = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockUsersService = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockSessionsService = {
      createSession: jest.fn(),
      validateSession: jest.fn(),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const mockOAuthStateService = {
      generateState: jest.fn(),
      validateState: jest.fn(),
      cleanupExpiredStates: jest.fn(),
    };

    const mockReferralService = {
      applyReferral: jest.fn(),
      acceptReferral: jest.fn(),
      createReferralCode: jest.fn(),
      getReferralByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthLinkedinHandler,
        {
          provide: LinkedinService,
          useValue: mockLinkedinService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
        {
          provide: OAuthStateService,
          useValue: mockOAuthStateService,
        },
        {
          provide: ReferralService,
          useValue: mockReferralService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<AuthLinkedinHandler>(AuthLinkedinHandler);
    linkedinService = module.get(LinkedinService);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    sessionsService = module.get(SessionsService);
    oauthStateService = module.get(OAuthStateService);
    logger = module.get('Logger');

    // Default mock: OAuth state validation succeeds
    oauthStateService.validateState.mockResolvedValue(true);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockState = 'valid-oauth-state-12345678901234567890123456789012';
    const mockCode = 'valid-linkedin-code';
    const mockAccessTokenData = {
      access_token: 'linkedin-access-token-123',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile email',
      id_token: 'linkedin-id-token-123',
    };
    const mockUserInfo = {
      sub: 'linkedin-user-id',
      email: 'test@example.com',
      email_verified: true,
      name: 'John Doe',
      locale: { country: 'US', language: 'en' },
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/picture.jpg',
    };
    const mockExistingUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      authType: AuthType.EMAIL,
      isEmailVerified: false,
      googleId: null,
      linkedinId: null,
      phoneNumber: null,
      lastSignupAttemptAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockNewUser = {
      id: 'new-user-id',
      email: 'test@example.com',
      password: null,
      authType: AuthType.LINKEDIN,
      isEmailVerified: true,
      googleId: null,
      linkedinId: 'linkedin-user-id',
      phoneNumber: null,
      lastSignupAttemptAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockSession = {
      id: 'session-id',
      sessionId: 'session-123',
      userId: 'user-id',
      token: 'session-token-123',
      fingerprint: 'fingerprint-123',
      deviceFingerprint: '',
      isOtpOnlySession: false,
      isRevoked: false,
      lastUsage: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceInfo: '',
      ipAddress: '',
      location: '',
      userAgent: '',
    };

    it('should authenticate with LinkedIn successfully for new user', async () => {
      // Arrange
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null); // User doesn't exist
      authService.create.mockResolvedValue(mockNewUser);
      sessionsService.createSession.mockResolvedValue(mockSession);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        code: mockCode,
        state: mockState,
      });

      // Assert
      expect(result).toEqual({
        sessionId: mockSession.sessionId,
        user: {
          id: mockNewUser.id,
          email: mockUserInfo.email,
          firstName: mockUserInfo.given_name,
          lastName: mockUserInfo.family_name,
          picture: mockUserInfo.picture,
        },
      });

      expect(linkedinService.getAccessToken).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: { code: mockCode },
      });

      expect(linkedinService.getUserInfo).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        accessToken: mockAccessTokenData.access_token,
      });

      expect(usersService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { email: mockUserInfo.email },
      });

      expect(authService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          email: mockUserInfo.email,
          authType: 'LINKEDIN',
          isEmailVerified: mockUserInfo.email_verified,
          linkedinId: mockUserInfo.sub,
        },
      });

      expect(sessionsService.createSession).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: { userId: mockNewUser.id, userAgent: undefined, ipAddress: undefined },
      });
    });

    it('should authenticate with LinkedIn successfully for existing user', async () => {
      // Arrange
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(mockExistingUser); // User exists
      authService.update.mockResolvedValue({
        ...mockExistingUser,
        linkedinId: mockUserInfo.sub,
        isEmailVerified: true,
      });
      sessionsService.createSession.mockResolvedValue(mockSession);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        code: mockCode,
        state: mockState,
      });

      // Assert
      expect(result).toEqual({
        sessionId: mockSession.sessionId,
        user: {
          id: mockExistingUser.id,
          email: mockUserInfo.email,
          firstName: mockUserInfo.given_name,
          lastName: mockUserInfo.family_name,
          picture: mockUserInfo.picture,
        },
      });

      expect(authService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockExistingUser.id },
        data: {
          linkedinId: mockUserInfo.sub,
          isEmailVerified: mockUserInfo.email_verified,
        },
      });
    });

    it('should throw AuthLinkedinHandlerException when getAccessToken fails', async () => {
      // Arrange
      const mockError = new Error('Invalid LinkedIn code');
      linkedinService.getAccessToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthLinkedinHandlerException);
    });

    it('should throw AuthLinkedinHandlerException when getUserInfo fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get LinkedIn user info');
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthLinkedinHandlerException);
    });

    it('should throw AuthLinkedinHandlerException when user creation fails', async () => {
      // Arrange
      const mockError = new Error('Database error during user creation');
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null);
      authService.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthLinkedinHandlerException);
    });

    it('should throw AuthLinkedinHandlerException when session creation fails', async () => {
      // Arrange
      const mockError = new Error('Session creation failed');
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null);
      authService.create.mockResolvedValue(mockNewUser);
      sessionsService.createSession.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthLinkedinHandlerException);
    });

    it('should log execution start and end', async () => {
      // Arrange
      linkedinService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      linkedinService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null);
      authService.create.mockResolvedValue(mockNewUser);
      sessionsService.createSession.mockResolvedValue(mockSession);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        code: mockCode,
        state: mockState,
      });

      // Assert
      expect(logger.debug).toHaveBeenCalledWith(
        'Begin AuthLinkedinHandler.execute',
        expect.objectContaining({
          transactionId: mockTransactionId,
          input: expect.objectContaining({
            code: mockCode,
          }),
        }),
      );

      expect(logger.debug).toHaveBeenCalledWith(
        'End AuthLinkedinHandler.execute',
        expect.objectContaining({
          transactionId: mockTransactionId,
          output: expect.objectContaining({
            sessionId: mockSession.sessionId,
          }),
        }),
      );
    });
  });
});
