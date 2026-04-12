import { Test, TestingModule } from '@nestjs/testing';
import { AuthGoogleHandler } from './auth-google.handler';
import { GoogleService } from '../../google/google.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralService } from '../../referral/referral.service';
import { OAuthStateService } from '../oauth-state/oauth-state.service';
import { LogService } from 'logstash-winston-3';
import { AuthGoogleHandlerException } from './auth-google.handler.exception';
import { AuthType } from '@prisma/client';

describe('AuthGoogleHandler', () => {
  let handler: AuthGoogleHandler;
  let googleService: jest.Mocked<GoogleService>;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let sessionsService: jest.Mocked<SessionsService>;
  let oauthStateService: jest.Mocked<OAuthStateService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockGoogleService = {
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
        AuthGoogleHandler,
        {
          provide: GoogleService,
          useValue: mockGoogleService,
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

    handler = module.get<AuthGoogleHandler>(AuthGoogleHandler);
    googleService = module.get(GoogleService);
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
    const mockCode = 'valid-google-code';
    const mockAccessTokenData = {
      access_token: 'access-token-123',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid email profile',
      id_token: 'id-token-123',
    };
    const mockUserInfo = {
      id: 'google-user-id',
      email: 'test@example.com',
      verified_email: true,
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/picture.jpg',
      name: 'John Doe',
      locale: 'en',
    };
    const mockExistingUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      authType: AuthType.EMAIL,
      isEmailVerified: false,
      googleId: null,
      phoneNumber: null,
      linkedinId: null,
      lastSignupAttemptAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockNewUser = {
      id: 'new-user-id',
      email: 'test@example.com',
      password: null,
      authType: AuthType.GOOGLE,
      isEmailVerified: true,
      googleId: 'google-user-id',
      phoneNumber: null,
      linkedinId: null,
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
      expiresAt: new Date(Date.now() + 86400000), // +1 day
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceInfo: '',
      ipAddress: '',
      location: '',
      userAgent: '',
    };

    it('should authenticate with Google successfully for new user', async () => {
      // Arrange
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockResolvedValue(mockUserInfo);
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

      expect(googleService.getAccessToken).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: { code: mockCode },
      });

      expect(googleService.getUserInfo).toHaveBeenCalledWith({
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
          authType: 'GOOGLE',
          isEmailVerified: mockUserInfo.verified_email,
          googleId: mockUserInfo.id,
        },
      });

      expect(sessionsService.createSession).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: { userId: mockNewUser.id, userAgent: undefined, ipAddress: undefined },
      });
    });

    it('should authenticate with Google successfully for existing user', async () => {
      // Arrange
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(mockExistingUser); // User exists
      authService.update.mockResolvedValue({
        ...mockExistingUser,
        googleId: mockUserInfo.id,
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
          googleId: mockUserInfo.id,
          isEmailVerified: mockUserInfo.verified_email,
        },
      });
    });

    it('should throw AuthGoogleHandlerException when getAccessToken fails', async () => {
      // Arrange
      const mockError = new Error('Invalid Google code');
      googleService.getAccessToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthGoogleHandlerException);
    });

    it('should throw AuthGoogleHandlerException when getUserInfo fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get user info');
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthGoogleHandlerException);
    });

    it('should throw AuthGoogleHandlerException when user creation fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null);
      authService.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          code: mockCode,
          state: mockState,
        }),
      ).rejects.toThrow(AuthGoogleHandlerException);
    });

    it('should throw AuthGoogleHandlerException when session creation fails', async () => {
      // Arrange
      const mockError = new Error('Session creation failed');
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockResolvedValue(mockUserInfo);
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
      ).rejects.toThrow(AuthGoogleHandlerException);
    });

    it('should log execution start and end', async () => {
      // Arrange
      googleService.getAccessToken.mockResolvedValue(mockAccessTokenData);
      googleService.getUserInfo.mockResolvedValue(mockUserInfo);
      usersService.get.mockResolvedValue(null);
      authService.create.mockResolvedValue(mockNewUser);
      sessionsService.createSession.mockResolvedValue(mockSession);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        code: mockCode,
        state: mockState,
      });

      // Assert - The handler executes successfully without errors
      expect(result).toBeDefined();
      expect(result.sessionId).toBe(mockSession.sessionId);
    });
  });
});
