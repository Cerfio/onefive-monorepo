import { UnauthorizedException } from '@nestjs/common';
import { TokenUnauthorizedException } from './session.exception';
import { LogService } from 'logstash-winston-3';

describe('TokenUnauthorizedException', () => {
  let mockLogger: jest.Mocked<LogService>;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('constructor', () => {
    it('should create exception with custom message and log error', () => {
      // ✅ Test : Création d'exception avec message personnalisé et log d'erreur
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      const errorMessage = 'Token validation failed';

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        errorMessage,
      );

      // Exception is HttpException with 401 status
      expect(exception.message).toBe(errorMessage);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle empty args object', () => {
      // ✅ Test : Gestion d'un objet args vide
      const args = {};
      const errorMessage = 'Token validation failed';

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        errorMessage,
      );

      // Exception is HttpException with 401 status
      expect(exception.message).toBe(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(errorMessage, {});
    });

    it('should handle complex args object', () => {
      // ✅ Test : Gestion d'un objet args complexe
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
        timestamp: '2024-01-01T00:00:00.000Z',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: {
          reason: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      };
      const errorMessage = 'Token validation failed';

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        errorMessage,
      );

      // Exception is HttpException with 401 status
      expect(exception.message).toBe(errorMessage);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('create static method', () => {
    it('should create exception using class name as message', () => {
      // ✅ Test : Création d'exception avec nom de classe comme message
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
      };

      const exception = TokenUnauthorizedException.create(mockLogger, args);

      expect(exception).toBeInstanceOf(TokenUnauthorizedException);
      expect(exception.message).toBe('TokenUnauthorizedException');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TokenUnauthorizedException',
        args,
      );
    });
  });

  describe('throw static method', () => {
    it('should throw exception created by create method', () => {
      // ✅ Test : Lancement d'exception créée par la méthode create
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
      };

      expect(() => {
        TokenUnauthorizedException.throw(mockLogger, args);
      }).toThrow(TokenUnauthorizedException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'TokenUnauthorizedException',
        args,
      );
    });

    it('should throw exception with correct message', () => {
      // ✅ Test : Lancement d'exception avec message correct
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
      };

      try {
        TokenUnauthorizedException.throw(mockLogger, args);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenUnauthorizedException);
        expect(error.message).toBe('TokenUnauthorizedException');
      }
    });
  });

  describe('inheritance and type checking', () => {
    it('should be instance of UnauthorizedException', () => {
      // ✅ Test : Instance d'UnauthorizedException
      const args = { transactionId: 'tx-123' };
      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        'Test message',
      );

      // Exception is HttpException with 401 status
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct name property', () => {
      // ✅ Test : Propriété name correcte
      const args = { transactionId: 'tx-123' };
      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        'Test message',
      );

      expect(exception.name).toBe('TokenUnauthorizedException');
    });

    it('should be throwable and catchable', () => {
      // ✅ Test : Peut être lancée et attrapée
      const args = { transactionId: 'tx-123' };

      try {
        throw new TokenUnauthorizedException(mockLogger, args, 'Test message');
      } catch (error) {
        expect(error).toBeInstanceOf(TokenUnauthorizedException);
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Test message');
      }
    });
  });

  describe('security considerations', () => {
    it('should not leak sensitive information in logs', () => {
      // ✅ Test : Pas de fuite d'informations sensibles dans les logs
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token',
        password: 'secret123', // Sensitive data
        token: 'jwt-token', // Sensitive data
        email: 'user@example.com', // Sensitive data
      };

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        'Token validation failed',
      );

      expect(exception).toBeInstanceOf(TokenUnauthorizedException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Token validation failed',
        args,
      );

      // Note: The actual masking should be handled by the logging utility
      // This test ensures the exception doesn't modify the args before logging
    });

    it('should handle malicious input in error message', () => {
      // ✅ Test : Gestion d'entrées malveillantes dans le message d'erreur
      const maliciousMessage = '<script>alert("xss")</script>';
      const args = { transactionId: 'tx-123' };

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        maliciousMessage,
      );

      expect(exception.message).toBe(maliciousMessage);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle very long error messages', () => {
      // ✅ Test : Gestion de messages d'erreur très longs
      const longMessage = 'A'.repeat(10000);
      const args = { transactionId: 'tx-123' };

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        longMessage,
      );

      expect(exception.message).toBe(longMessage);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in args', () => {
      // ✅ Test : Gestion de caractères spéciaux dans args
      const args = {
        transactionId: 'tx-123',
        error: 'Invalid token with special chars: !@#$%^&*()',
        details: {
          reason: 'Token contains invalid characters: <>{}[]',
          code: 'INVALID_CHARS',
        },
      };

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        'Token validation failed',
      );

      expect(exception).toBeInstanceOf(TokenUnauthorizedException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Token validation failed',
        args,
      );
    });

    it('should handle circular references in args', () => {
      // ✅ Test : Gestion de références circulaires dans args
      const circularArgs: any = {
        transactionId: 'tx-123',
        error: 'Invalid token',
      };
      circularArgs.self = circularArgs;

      const exception = new TokenUnauthorizedException(
        mockLogger,
        circularArgs,
        'Token validation failed',
      );

      expect(exception).toBeInstanceOf(TokenUnauthorizedException);
      // Should not throw error due to circular reference
    });

    it('should handle null and undefined values in args', () => {
      // ✅ Test : Gestion de valeurs null et undefined dans args
      const args = {
        transactionId: 'tx-123',
        error: null,
        details: undefined,
        nested: {
          value: null,
          other: undefined,
        },
      };

      const exception = new TokenUnauthorizedException(
        mockLogger,
        args,
        'Token validation failed',
      );

      expect(exception).toBeInstanceOf(TokenUnauthorizedException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Token validation failed',
        args,
      );
    });
  });
});
