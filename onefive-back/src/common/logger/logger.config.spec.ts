import loggerLogstashInstance from './logger.config';

// Mock the LogService
jest.mock('logstash-winston-3', () => ({
  LogService: {
    getInstance: jest.fn(),
  },
}));

// Mock the NestJS Logger - same singleton returned for every new Logger()
jest.mock('@nestjs/common', () => {
  const instance = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    Logger: jest.fn().mockImplementation(() => instance),
  };
});

describe('Logger Config', () => {
  let mockLogService: any;
  let mockNestLogger: any;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    // Force non-test mode so LogService.getInstance is actually called
    process.env.NODE_ENV = 'development';

    // Get mocked instances
    const { LogService } = require('logstash-winston-3');
    const { Logger } = require('@nestjs/common');

    mockLogService = LogService.getInstance;
    mockNestLogger = new Logger(); // same singleton as the one in logger.config.ts
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('loggerLogstashInstance', () => {
    it('should create logger instance with correct configuration', () => {
      // ✅ Test : Création d'instance de logger avec configuration correcte
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      const result = loggerLogstashInstance();

      expect(mockLogService).toHaveBeenCalledWith({
        serviceName: 'onefive-authentication',
        logstashHost: process.env.LOGSTASH_HOST,
        logstashPort: process.env.LOGSTASH_PORT,
        level: 'debug',
        callback: expect.any(Function),
      });

      expect(result).toBe(mockLoggerInstance);
    });

    it('should use environment variables for configuration', () => {
      // ✅ Test : Utilisation des variables d'environnement pour la configuration
      const originalLogstashHost = process.env.LOGSTASH_HOST;
      const originalLogstashPort = process.env.LOGSTASH_PORT;

      process.env.LOGSTASH_HOST = 'test-host';
      process.env.LOGSTASH_PORT = '5000';

      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      expect(mockLogService).toHaveBeenCalledWith({
        serviceName: 'onefive-authentication',
        logstashHost: 'test-host',
        logstashPort: '5000',
        level: 'debug',
        callback: expect.any(Function),
      });

      // Restore original values
      process.env.LOGSTASH_HOST = originalLogstashHost;
      process.env.LOGSTASH_PORT = originalLogstashPort;
    });

    it('should handle undefined environment variables', () => {
      // ✅ Test : Gestion de variables d'environnement undefined
      const originalLogstashHost = process.env.LOGSTASH_HOST;
      const originalLogstashPort = process.env.LOGSTASH_PORT;

      delete process.env.LOGSTASH_HOST;
      delete process.env.LOGSTASH_PORT;

      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      expect(mockLogService).toHaveBeenCalledWith({
        serviceName: 'onefive-authentication',
        logstashHost: undefined,
        logstashPort: undefined,
        level: 'debug',
        callback: expect.any(Function),
      });

      // Restore original values
      process.env.LOGSTASH_HOST = originalLogstashHost;
      process.env.LOGSTASH_PORT = originalLogstashPort;
    });

    it('should set correct service name', () => {
      // ✅ Test : Définition du nom de service correct
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      expect(mockLogService).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceName: 'onefive-authentication',
        }),
      );
    });

    it('should set correct log level', () => {
      // ✅ Test : Définition du niveau de log correct
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      expect(mockLogService).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        }),
      );
    });

    it('should provide callback function', () => {
      // ✅ Test : Fourniture de fonction de callback
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      expect(typeof config.callback).toBe('function');
    });
  });

  describe('callback function', () => {
    it('should call NestJS logger with correct level and message', () => {
      // ✅ Test : Appel du logger NestJS avec niveau et message corrects
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      // Test different log levels
      callback('debug', 'Debug message');
      callback('info', 'Info message');
      callback('warn', 'Warning message');
      callback('error', 'Error message');

      expect(mockNestLogger.debug).toHaveBeenCalledWith('Debug message');
      expect(mockNestLogger.info).toHaveBeenCalledWith('Info message');
      expect(mockNestLogger.warn).toHaveBeenCalledWith('Warning message');
      expect(mockNestLogger.error).toHaveBeenCalledWith('Error message');
    });

    it('should handle empty messages', () => {
      // ✅ Test : Gestion de messages vides
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      callback('info', '');
      callback('warn', '');

      expect(mockNestLogger.info).toHaveBeenCalledWith('');
      expect(mockNestLogger.warn).toHaveBeenCalledWith('');
    });

    it('should handle null and undefined messages', () => {
      // ✅ Test : Gestion de messages null et undefined
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      callback('info', null);
      callback('warn', undefined);

      expect(mockNestLogger.info).toHaveBeenCalledWith('null');
      expect(mockNestLogger.warn).toHaveBeenCalledWith('undefined');
    });

    it('should handle very long messages', () => {
      // ✅ Test : Gestion de messages très longs
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      const longMessage = 'A'.repeat(10000);
      callback('info', longMessage);

      expect(mockNestLogger.info).toHaveBeenCalledWith(longMessage);
    });

    it('should handle special characters in messages', () => {
      // ✅ Test : Gestion de caractères spéciaux dans les messages
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      const specialMessage = 'Message with special chars: !@#$%^&*()';
      callback('info', specialMessage);

      expect(mockNestLogger.info).toHaveBeenCalledWith(specialMessage);
    });

    it('should handle unicode characters in messages', () => {
      // ✅ Test : Gestion de caractères Unicode dans les messages
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      const unicodeMessage = 'Message with unicode: 世界 🌍';
      callback('info', unicodeMessage);

      expect(mockNestLogger.info).toHaveBeenCalledWith(unicodeMessage);
    });
  });

  describe('multiple instances', () => {
    it('should create multiple logger instances', () => {
      // ✅ Test : Création de plusieurs instances de logger
      const mockLoggerInstance1 = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const mockLoggerInstance2 = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService
        .mockReturnValueOnce(mockLoggerInstance1)
        .mockReturnValueOnce(mockLoggerInstance2);

      const instance1 = loggerLogstashInstance();
      const instance2 = loggerLogstashInstance();

      expect(instance1).toBe(mockLoggerInstance1);
      expect(instance2).toBe(mockLoggerInstance2);
      expect(mockLogService).toHaveBeenCalledTimes(2);
    });

    it('should maintain separate instances', () => {
      // ✅ Test : Maintien d'instances séparées
      const mockLoggerInstance1 = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const mockLoggerInstance2 = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService
        .mockReturnValueOnce(mockLoggerInstance1)
        .mockReturnValueOnce(mockLoggerInstance2);

      const instance1 = loggerLogstashInstance();
      const instance2 = loggerLogstashInstance();

      instance1.info('Message 1');
      instance2.info('Message 2');

      expect(mockLoggerInstance1.info).toHaveBeenCalledWith('Message 1');
      expect(mockLoggerInstance2.info).toHaveBeenCalledWith('Message 2');
    });
  });

  describe('error handling', () => {
    it('should handle LogService errors gracefully', () => {
      // ✅ Test : Gestion gracieuse des erreurs LogService
      mockLogService.mockImplementation(() => {
        throw new Error('LogService initialization failed');
      });

      expect(() => loggerLogstashInstance()).toThrow(
        'LogService initialization failed',
      );
    });

    it('should handle callback errors gracefully', () => {
      // ✅ Test : Gestion gracieuse des erreurs de callback
      const mockLoggerInstance = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockLogService.mockReturnValue(mockLoggerInstance);

      // Mock NestJS logger to throw error
      mockNestLogger.info.mockImplementation(() => {
        throw new Error('NestJS logger error');
      });

      loggerLogstashInstance();

      const config = mockLogService.mock.calls[0][0];
      const callback = config.callback;

      expect(() => callback('info', 'Test message')).toThrow(
        'NestJS logger error',
      );
    });
  });

  describe('test environment', () => {
    it('should return noop logger in test environment', () => {
      // ✅ Test : Retour du noop logger en environnement de test
      process.env.NODE_ENV = 'test';

      const result = loggerLogstashInstance();

      expect(result).toBeDefined();
      expect(typeof result.debug).toBe('function');
      expect(typeof result.info).toBe('function');
      expect(typeof result.warn).toBe('function');
      expect(typeof result.error).toBe('function');
      // LogService.getInstance should NOT have been called
      expect(mockLogService).not.toHaveBeenCalled();
    });

    it('noop logger methods should not throw', () => {
      // ✅ Test : Les méthodes du noop logger ne lancent pas d'erreur
      process.env.NODE_ENV = 'test';

      const result = loggerLogstashInstance() as any;

      expect(() => result.debug('test')).not.toThrow();
      expect(() => result.info('test')).not.toThrow();
      expect(() => result.warn('test')).not.toThrow();
      expect(() => result.error('test')).not.toThrow();
    });
  });
});
