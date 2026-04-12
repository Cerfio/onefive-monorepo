import { Test, TestingModule } from '@nestjs/testing';
import { Inject } from '@nestjs/common';
import { LoggerProvider } from './logger.provider';

// Mock the logger config - same singleton for every call
jest.mock('./logger.config', () => {
  const instance = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(instance),
  };
});

describe('LoggerProvider', () => {
  let provider: any;
  let mockLoggerInstance: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerProvider],
    }).compile();

    provider = module.get('Logger');

    // Get the mocked logger instance
    const loggerConfig = require('./logger.config').default;
    mockLoggerInstance = loggerConfig();

    jest.clearAllMocks();
  });

  describe('LoggerProvider configuration', () => {
    it('should provide logger instance', () => {
      // ✅ Test : Fourniture d'instance de logger
      expect(provider).toBeDefined();
      expect(typeof provider).toBe('object');
    });

    it('should have required logging methods', () => {
      // ✅ Test : Présence des méthodes de logging requises
      expect(typeof provider.debug).toBe('function');
      expect(typeof provider.info).toBe('function');
      expect(typeof provider.warn).toBe('function');
      expect(typeof provider.error).toBe('function');
    });

    it('should be injectable as Logger token', () => {
      // ✅ Test : Injection possible avec le token Logger
      expect(provider).toBeDefined();
      expect(provider).toBe(mockLoggerInstance);
    });
  });

  describe('Logger methods', () => {
    it('should call debug method', () => {
      // ✅ Test : Appel de la méthode debug
      const message = 'Debug message';
      const meta = { userId: '123', action: 'test' };

      provider.debug(message, meta);

      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(message, meta);
      expect(mockLoggerInstance.debug).toHaveBeenCalledTimes(1);
    });

    it('should call info method', () => {
      // ✅ Test : Appel de la méthode info
      const message = 'Info message';
      const meta = { userId: '123', action: 'test' };

      provider.info(message, meta);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, meta);
      expect(mockLoggerInstance.info).toHaveBeenCalledTimes(1);
    });

    it('should call warn method', () => {
      // ✅ Test : Appel de la méthode warn
      const message = 'Warning message';
      const meta = { userId: '123', action: 'test' };

      provider.warn(message, meta);

      expect(mockLoggerInstance.warn).toHaveBeenCalledWith(message, meta);
      expect(mockLoggerInstance.warn).toHaveBeenCalledTimes(1);
    });

    it('should call error method', () => {
      // ✅ Test : Appel de la méthode error
      const message = 'Error message';
      const meta = { userId: '123', action: 'test', error: 'Test error' };

      provider.error(message, meta);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, meta);
      expect(mockLoggerInstance.error).toHaveBeenCalledTimes(1);
    });

    it('should handle calls with null meta data', () => {
      // ✅ Test : Gestion d'appels avec métadonnées null
      const message = 'Message with null meta';
      const meta = null;

      provider.debug(message, meta);
      provider.info(message, meta);
      provider.warn(message, meta);
      provider.error(message, meta);

      expect(mockLoggerInstance.debug).toHaveBeenCalledWith(message, null);
      expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, null);
      expect(mockLoggerInstance.warn).toHaveBeenCalledWith(message, null);
      expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, null);
    });
  });

  describe('Logger integration', () => {
    it('should work with dependency injection', async () => {
      // ✅ Test : Fonctionnement avec l'injection de dépendances
      class TestService {
        constructor(@Inject('Logger') private readonly logger: any) {}

        testMethod() {
          this.logger.info('Test method called', { service: 'TestService' });
        }
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [LoggerProvider, TestService],
      }).compile();

      const testService = module.get<TestService>(TestService);

      testService.testMethod();

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(
        'Test method called',
        { service: 'TestService' },
      );
    });
  });

  describe('Logger security', () => {
    it('should handle sensitive data in logs', () => {
      // ✅ Test : Gestion de données sensibles dans les logs
      const sensitiveData = {
        password: 'secret123',
        token: 'jwt-token',
        email: 'user@example.com',
        otherData: 'not-sensitive',
      };

      provider.info('User login', sensitiveData);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(
        'User login',
        sensitiveData,
      );
      // Note: Actual masking should be handled by the logging utility
    });

    it('should handle malicious input in log messages', () => {
      // ✅ Test : Gestion d'entrées malveillantes dans les messages de log
      const maliciousMessage = '<script>alert("xss")</script>';
      const maliciousMeta = {
        userAgent: '<img src="x" onerror="alert(\'xss\')">',
        data: '; DROP TABLE users;',
      };

      provider.error(maliciousMessage, maliciousMeta);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        maliciousMessage,
        maliciousMeta,
      );
    });

    it('should handle very long log messages', () => {
      // ✅ Test : Gestion de messages de log très longs
      const longMessage = 'A'.repeat(10000);
      const longMeta = {
        data: 'B'.repeat(10000),
      };

      provider.info(longMessage, longMeta);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(
        longMessage,
        longMeta,
      );
    });
  });

  describe('Logger performance', () => {
    it('should handle concurrent logging operations', () => {
      // ✅ Test : Gestion d'opérations de logging concurrentes
      const messages = [
        'Message 1',
        'Message 2',
        'Message 3',
        'Message 4',
        'Message 5',
      ];

      // Simulate concurrent logging
      messages.forEach((message) => {
        provider.info(message, { timestamp: Date.now() });
      });

      expect(mockLoggerInstance.info).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid successive calls', () => {
      // ✅ Test : Gestion d'appels successifs rapides
      for (let i = 0; i < 100; i++) {
        provider.debug(`Debug message ${i}`, { index: i });
      }

      expect(mockLoggerInstance.debug).toHaveBeenCalledTimes(100);
    });
  });

  describe('Logger error handling', () => {
    it('should handle logger instance errors gracefully', () => {
      // ✅ Test : Gestion gracieuse des erreurs d'instance de logger
      const errorLogger = {
        debug: jest.fn().mockImplementation(() => {
          throw new Error('Logger error');
        }),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      // Mock the logger config to return error logger
      const loggerConfig = require('./logger.config').default;
      loggerConfig.mockReturnValueOnce(errorLogger);

      // Create new provider with error logger
      const errorProvider = (LoggerProvider as any).useFactory();

      expect(() => errorProvider.debug('Test message')).toThrow('Logger error');
      expect(() => errorProvider.info('Test message')).not.toThrow();
    });

    it('should handle null and undefined inputs', () => {
      // ✅ Test : Gestion d'entrées null et undefined
      expect(() => provider.debug(null)).not.toThrow();
      expect(() => provider.info(undefined)).not.toThrow();
      expect(() => provider.warn('', null)).not.toThrow();
      expect(() => provider.error('', undefined)).not.toThrow();
    });
  });
});
