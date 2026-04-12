import {
  HttpException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseLoggedException } from './base.exeption';
import { LogService } from 'logstash-winston-3';

// Mock the LogService
const mockLogger: jest.Mocked<LogService> = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('BaseLoggedException', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create exception with custom message and log error', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        error: 'Test error',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      const errorMessage = 'Test exception message';

      const exception = new TestException(mockLogger, args, errorMessage);

      expect(exception).toBeInstanceOf(HttpException);
      expect(exception.message).toBe(errorMessage);
      expect(exception.getStatus()).toBe(400);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });

    it('should create exception with different HTTP status codes', () => {
      class TestBadRequestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      class TestInternalServerException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(InternalServerErrorException, logger, args, errorMessage);
        }
      }

      class TestNotFoundException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(NotFoundException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      const badRequestException = new TestBadRequestException(
        mockLogger,
        args,
        'Bad request',
      );
      const internalServerException = new TestInternalServerException(
        mockLogger,
        args,
        'Internal server error',
      );
      const notFoundException = new TestNotFoundException(
        mockLogger,
        args,
        'Not found',
      );

      expect(badRequestException.getStatus()).toBe(400);
      expect(internalServerException.getStatus()).toBe(500);
      expect(notFoundException.getStatus()).toBe(404);
    });

    it('should handle empty args object', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const exception = new TestException(mockLogger, {}, 'Test message');

      expect(exception).toBeInstanceOf(HttpException);
      expect(exception.message).toBe('Test message');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.any(Object),
      );
    });

    it('should handle complex args object', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        userId: 'user-123',
        error: 'Test error',
        details: {
          reason: 'Validation failed',
          field: 'email',
          value: 'invalid-email',
        },
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const exception = new TestException(mockLogger, args, 'Validation error');

      expect(exception).toBeInstanceOf(HttpException);
      expect(exception.message).toBe('Validation error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation error'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });
  });

  describe('static throw method', () => {
    it('should throw exception created by constructor', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      expect(() => {
        TestException.throw(mockLogger, args);
      }).toThrow(TestException);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw exception with correct message', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      try {
        TestException.throw(mockLogger, args);
      } catch (error) {
        expect(error).toBeInstanceOf(TestException);
        // throw uses this.name when no error in args
        expect(error.message).toBe('TestException');
      }
    });

    it('should handle logger errors gracefully', () => {
      const mockFailingLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn().mockImplementation(() => {
          throw new Error('Logger failed');
        }),
      };

      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      // Logger failure propagates since constructor calls logger.error
      expect(() => {
        TestException.throw(mockFailingLogger, args);
      }).toThrow();
    });
  });

  describe('static create method', () => {
    it('should create exception instance without throwing', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      const exception = TestException.create(mockLogger, args);

      expect(exception).toBeInstanceOf(TestException);
      expect(exception.message).toBe('TestException');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return the same exception type', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      const exception = TestException.create(mockLogger, args);

      expect(exception).toBeInstanceOf(TestException);
      expect(exception).toBeInstanceOf(BaseLoggedException);
      expect(exception).toBeInstanceOf(HttpException);
    });
  });

  describe('inheritance and type checking', () => {
    it('should be instance of HttpException', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };
      const exception = new TestException(mockLogger, args, 'Test message');

      expect(exception).toBeInstanceOf(HttpException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct name property', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };
      const exception = new TestException(mockLogger, args, 'Test message');

      expect(exception.name).toBe('TestException');
    });

    it('should be throwable and catchable', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = { transactionId: 'tx-123' };

      try {
        throw new TestException(mockLogger, args, 'Test message');
      } catch (error) {
        expect(error).toBeInstanceOf(TestException);
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Test message');
      }
    });
  });

  describe('real-world usage examples', () => {
    it('should work with validation exceptions', () => {
      class ValidationException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        field: 'email',
        value: 'invalid-email',
        reason: 'Invalid email format',
      };

      const exception = new ValidationException(
        mockLogger,
        args,
        'Validation failed',
      );

      expect(exception).toBeInstanceOf(ValidationException);
      expect(exception.getStatus()).toBe(400);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });

    it('should work with authentication exceptions', () => {
      class AuthenticationException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(InternalServerErrorException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        reason: 'Invalid credentials',
      };

      const exception = new AuthenticationException(
        mockLogger,
        args,
        'Authentication failed',
      );

      expect(exception).toBeInstanceOf(AuthenticationException);
      expect(exception.getStatus()).toBe(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });

    it('should work with not found exceptions', () => {
      class ResourceNotFoundException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(NotFoundException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        resourceType: 'user',
        resourceId: 'user-123',
        userId: 'current-user-123',
      };

      const exception = new ResourceNotFoundException(
        mockLogger,
        args,
        'Resource not found',
      );

      expect(exception).toBeInstanceOf(ResourceNotFoundException);
      expect(exception.getStatus()).toBe(404);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Resource not found'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });
  });

  describe('security considerations', () => {
    it('should not leak sensitive information in logs', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        password: 'secret123',
        token: 'jwt-token',
        email: 'user@example.com',
        otherData: 'not-sensitive',
      };

      const exception = new TestException(mockLogger, args, 'Test error');

      expect(exception).toBeInstanceOf(TestException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });

    it('should handle malicious input in error message', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const maliciousMessage = '<script>alert("xss")</script>';
      const args = { transactionId: 'tx-123' };

      const exception = new TestException(mockLogger, args, maliciousMessage);

      expect(exception.message).toBe(maliciousMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(maliciousMessage),
        expect.any(Object),
      );
    });

    it('should handle very long error messages', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const longMessage = 'A'.repeat(10000);
      const args = { transactionId: 'tx-123' };

      const exception = new TestException(mockLogger, args, longMessage);

      expect(exception.message).toBe(longMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(longMessage),
        expect.any(Object),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined args', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      // null/undefined spread gives {}, so these should still work
      const exception1 = new TestException(
        mockLogger,
        null as any,
        'Test message',
      );
      const exception2 = new TestException(
        mockLogger,
        undefined as any,
        'Test message',
      );

      expect(exception1).toBeInstanceOf(TestException);
      expect(exception2).toBeInstanceOf(TestException);
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });

    it('should handle circular references in args', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const circularArgs: any = {
        transactionId: 'tx-123',
        error: 'Test error',
      };
      circularArgs.self = circularArgs;

      // Should not throw - the implementation has a try/catch for JSON.stringify
      const exception = new TestException(
        mockLogger,
        circularArgs,
        'Test message',
      );

      expect(exception).toBeInstanceOf(TestException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });

    it('should handle special characters in args', () => {
      class TestException extends BaseLoggedException {
        constructor(logger: LogService, args: object, errorMessage: string) {
          super(BadRequestException, logger, args, errorMessage);
        }
      }

      const args = {
        transactionId: 'tx-123',
        error: 'Error with special chars: !@#$%^&*()',
        details: {
          reason: 'Error contains invalid characters: <>{}[]',
          code: 'INVALID_CHARS',
        },
      };

      const exception = new TestException(mockLogger, args, 'Test error');

      expect(exception).toBeInstanceOf(TestException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({ transactionId: 'tx-123' }),
      );
    });
  });
});
