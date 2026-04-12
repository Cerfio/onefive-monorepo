import { Log } from './logger.decorator';

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
    default: () => instance,
  };
});

// Mock the utils
jest.mock('../utils', () => ({
  FIELD_TO_MASK: ['password', 'email', 'token'],
  FORCE_MASK_NAME: ['SigninHandler', 'AuthService'],
  maskSensitiveData: jest.fn((data, fields, forceMask) => {
    if (forceMask) {
      return '********';
    }
    const masked = { ...data };
    fields.forEach((field) => {
      if (masked[field]) {
        masked[field] = '********';
      }
    });
    return masked;
  }),
}));

describe('Log Decorator', () => {
  let mockLogger: any;
  let mockMaskSensitiveData: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get mocked instances
    const loggerConfig = require('./logger.config').default;
    mockLogger = loggerConfig();

    const { maskSensitiveData } = require('../utils');
    mockMaskSensitiveData = maskSensitiveData;
  });

  describe('Log decorator basic functionality', () => {
    it('should log method entry and exit', async () => {
      // ✅ Test : Logging d'entrée et sortie de méthode
      class TestService {
        @Log()
        async testMethod(args: { transactionId: string; data: string }) {
          return { result: 'success', data: args.data };
        }
      }

      const service = new TestService();
      const result = await service.testMethod({
        transactionId: 'tx-123',
        data: 'test-data',
      });

      expect(result).toEqual({ result: 'success', data: 'test-data' });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);

      // Check entry log
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Begin TestService.testMethod',
        expect.objectContaining({
          transactionId: 'tx-123',
          input: expect.objectContaining({
            data: 'test-data',
          }),
          class: 'TestService',
          method: 'testMethod',
          action: 'entering',
        }),
      );

      // Check exit log
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'End TestService.testMethod',
        expect.objectContaining({
          transactionId: 'tx-123',
          output: expect.objectContaining({
            result: 'success',
            data: 'test-data',
          }),
          timeRequest: expect.any(String),
          class: 'TestService',
          method: 'testMethod',
          action: 'exiting',
        }),
      );
    });

    it('should use custom alias when provided', async () => {
      // ✅ Test : Utilisation d'alias personnalisé quand fourni
      class TestService {
        @Log({ alias: 'CustomService' })
        async testMethod(args: { transactionId: string; data: string }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();
      await service.testMethod({
        transactionId: 'tx-123',
        data: 'test-data',
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Begin CustomService.testMethod',
        expect.objectContaining({
          class: 'CustomService',
        }),
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'End CustomService.testMethod',
        expect.objectContaining({
          class: 'CustomService',
        }),
      );
    });

    it('should mask sensitive data in output', async () => {
      // ✅ Test : Masquage des données sensibles en sortie
      class TestService {
        @Log()
        async testMethod(args: { transactionId: string }) {
          return {
            email: 'test@example.com',
            password: 'secret123',
            otherData: 'not-sensitive',
          };
        }
      }

      const service = new TestService();
      await service.testMethod({
        transactionId: 'tx-123',
      });

      expect(mockMaskSensitiveData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'secret123',
          otherData: 'not-sensitive',
        }),
        ['password', 'email', 'token'],
        false,
      );
    });

    it('should force mask output for specific classes', async () => {
      // ✅ Test : Masquage forcé de sortie pour des classes spécifiques
      class SigninHandler {
        @Log()
        async execute(args: { transactionId: string }) {
          return {
            email: 'test@example.com',
            password: 'secret123',
            token: 'jwt-token',
          };
        }
      }

      const service = new SigninHandler();
      await service.execute({
        transactionId: 'tx-123',
      });

      expect(mockMaskSensitiveData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'secret123',
          token: 'jwt-token',
        }),
        ['password', 'email', 'token'],
        true, // Should force mask for SigninHandler
      );
    });

    it('should force mask output for specific methods', async () => {
      // ✅ Test : Masquage forcé de sortie pour des méthodes spécifiques
      class TestService {
        @Log()
        async AuthService(args: { transactionId: string }) {
          return {
            email: 'test@example.com',
            password: 'secret123',
            token: 'jwt-token',
          };
        }
      }

      const service = new TestService();
      await service.AuthService({
        transactionId: 'tx-123',
      });

      expect(mockMaskSensitiveData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'secret123',
          token: 'jwt-token',
        }),
        ['password', 'email', 'token'],
        true, // Should force mask for AuthService method
      );
    });
  });

  describe('Log decorator with different method types', () => {
    it('should work with methods that throw errors', async () => {
      // ✅ Test : Fonctionnement avec méthodes qui lancent des erreurs
      class TestService {
        @Log()
        async errorMethod(args: { transactionId: string }) {
          throw new Error('Test error');
        }
      }

      const service = new TestService();

      await expect(
        service.errorMethod({
          transactionId: 'tx-123',
        }),
      ).rejects.toThrow('Test error');

      // Should still log entry
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Begin TestService.errorMethod',
        expect.objectContaining({
          transactionId: 'tx-123',
          action: 'entering',
        }),
      );
    });

    it('should work with methods that return undefined', async () => {
      // ✅ Test : Fonctionnement avec méthodes qui retournent undefined
      class TestService {
        @Log()
        async voidMethod(args: { transactionId: string }) {
          // No return statement
        }
      }

      const service = new TestService();
      const result = await service.voidMethod({
        transactionId: 'tx-123',
      });

      expect(result).toBeUndefined();
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should work with methods that return null', async () => {
      // ✅ Test : Fonctionnement avec méthodes qui retournent null
      class TestService {
        @Log()
        async nullMethod(args: { transactionId: string }) {
          return null;
        }
      }

      const service = new TestService();
      const result = await service.nullMethod({
        transactionId: 'tx-123',
      });

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe('Log decorator with different argument types', () => {
    it('should handle methods with multiple arguments', async () => {
      // ✅ Test : Gestion de méthodes avec plusieurs arguments
      class TestService {
        @Log()
        async multiArgsMethod(
          args: { transactionId: string; data: string },
          extraArg: string,
          anotherArg: number,
        ) {
          return { result: 'success', extraArg, anotherArg };
        }
      }

      const service = new TestService();
      const result = await service.multiArgsMethod(
        { transactionId: 'tx-123', data: 'test-data' },
        'extra',
        42,
      );

      expect(result).toEqual({
        result: 'success',
        extraArg: 'extra',
        anotherArg: 42,
      });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should handle methods with complex argument objects', async () => {
      // ✅ Test : Gestion de méthodes avec objets d'arguments complexes
      class TestService {
        @Log()
        async complexArgsMethod(args: {
          transactionId: string;
          user: { id: string; name: string };
          settings: { theme: string; notifications: boolean };
        }) {
          return { result: 'success', user: args.user };
        }
      }

      const service = new TestService();
      const result = await service.complexArgsMethod({
        transactionId: 'tx-123',
        user: { id: 'user-123', name: 'John Doe' },
        settings: { theme: 'dark', notifications: true },
      });

      expect(result).toEqual({
        result: 'success',
        user: { id: 'user-123', name: 'John Doe' },
      });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe('Log decorator performance', () => {
    it('should handle concurrent method calls', async () => {
      // ✅ Test : Gestion d'appels de méthodes concurrents
      class TestService {
        @Log()
        async concurrentMethod(args: { transactionId: string; id: number }) {
          return { result: 'success', id: args.id };
        }
      }

      const service = new TestService();

      // Simulate concurrent calls
      const promises = Array(10)
        .fill(null)
        .map((_, index) =>
          service.concurrentMethod({
            transactionId: `tx-${index}`,
            id: index,
          }),
        );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockLogger.debug).toHaveBeenCalledTimes(20); // 2 calls per method
    });
  });

  describe('Log decorator edge cases', () => {
    it('should handle methods with symbol property keys', async () => {
      // ✅ Test : Gestion de méthodes avec clés de propriété symbol
      const symbolKey = Symbol('testMethod');

      class TestService {
        @Log()
        async [symbolKey](args: { transactionId: string }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();
      const result = await service[symbolKey]({
        transactionId: 'tx-123',
      });

      expect(result).toEqual({ result: 'success' });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should handle methods with special characters in names', async () => {
      // ✅ Test : Gestion de méthodes avec caractères spéciaux dans les noms
      class TestService {
        @Log()
        async 'method-with-dashes'(args: { transactionId: string }) {
          return { result: 'success' };
        }

        @Log()
        async method_with_underscores(args: { transactionId: string }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();

      await service['method-with-dashes']({ transactionId: 'tx-123' });
      await service['method_with_underscores']({ transactionId: 'tx-123' });

      expect(mockLogger.debug).toHaveBeenCalledTimes(4);
    });

    it('should handle methods with very long names', async () => {
      // ✅ Test : Gestion de méthodes avec noms très longs
      const longMethodName = 'a'.repeat(100);

      class TestService {
        @Log()
        async [longMethodName](args: { transactionId: string }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();
      const result = await service[longMethodName]({
        transactionId: 'tx-123',
      });

      expect(result).toEqual({ result: 'success' });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should handle methods with null and undefined arguments', async () => {
      // ✅ Test : Gestion de méthodes avec arguments null et undefined
      class TestService {
        @Log()
        async nullArgsMethod(args: { transactionId: string; data: any }) {
          return { result: 'success', data: args.data };
        }
      }

      const service = new TestService();

      await service.nullArgsMethod({
        transactionId: 'tx-123',
        data: null,
      });

      await service.nullArgsMethod({
        transactionId: 'tx-123',
        data: undefined,
      });

      expect(mockLogger.debug).toHaveBeenCalledTimes(4);
    });
  });

  describe('Log decorator security', () => {
    it('should handle malicious input in arguments', async () => {
      // ✅ Test : Gestion d'entrées malveillantes dans les arguments
      class TestService {
        @Log()
        async maliciousMethod(args: {
          transactionId: string;
          maliciousData: string;
        }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();
      await service.maliciousMethod({
        transactionId: 'tx-123',
        maliciousData: '<script>alert("xss")</script>',
      });

      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
      // Should not throw error
    });

    it('should handle very large argument objects', async () => {
      // ✅ Test : Gestion d'objets d'arguments très volumineux
      class TestService {
        @Log()
        async largeArgsMethod(args: { transactionId: string; largeData: any }) {
          return { result: 'success' };
        }
      }

      const service = new TestService();
      const largeData = { data: 'A'.repeat(10000) };

      await service.largeArgsMethod({
        transactionId: 'tx-123',
        largeData,
      });

      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });
  });
});
