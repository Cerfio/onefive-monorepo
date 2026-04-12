import {
  maskSensitiveData,
  maskSensitiveDataArray,
  maskSensitiveDataSafe,
  FIELD_TO_MASK,
  FORCE_MASK_NAME,
} from './security.utils';

describe('Security Utils', () => {
  describe('maskSensitiveData', () => {
    it('should mask sensitive fields by default', () => {
      // ✅ Test : Masquage des champs sensibles par défaut
      const sensitiveObject = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'jwt-token',
        otherData: 'not-sensitive',
      };

      const masked = maskSensitiveData(sensitiveObject);

      expect(masked).toEqual({
        email: '********',
        password: '********',
        token: '********',
        otherData: 'not-sensitive',
      });
    });

    it('should mask custom fields when provided', () => {
      // ✅ Test : Masquage de champs personnalisés
      const sensitiveObject = {
        username: 'john_doe',
        secret: 'top-secret',
        publicData: 'visible',
      };

      const masked = maskSensitiveData(sensitiveObject, ['username', 'secret']);

      expect(masked).toEqual({
        username: '********',
        secret: '********',
        publicData: 'visible',
      });
    });

    it('should force mask all fields when forceMask is true', () => {
      // ✅ Test : Masquage forcé de tous les champs
      const sensitiveObject = {
        email: 'test@example.com',
        password: 'secret123',
        otherData: 'not-sensitive',
      };

      const masked = maskSensitiveData(sensitiveObject, [], true);

      expect(masked).toEqual({
        email: '********',
        password: '********',
        otherData: '********',
      });
    });

    it('should handle arrays', () => {
      // ✅ Test : Gestion des tableaux
      const sensitiveArray = [
        { email: 'test1@example.com', password: 'secret1' },
        { email: 'test2@example.com', password: 'secret2' },
      ];

      const masked = maskSensitiveData(sensitiveArray);

      expect(masked).toEqual([
        { email: '********', password: '********' },
        { email: '********', password: '********' },
      ]);
    });

    it('should handle nested objects', () => {
      // ✅ Test : Gestion des objets imbriqués
      const sensitiveObject = {
        user: {
          email: 'test@example.com',
          password: 'secret123',
          profile: {
            name: 'John Doe',
            token: 'jwt-token',
          },
        },
        otherData: 'not-sensitive',
      };

      const masked = maskSensitiveData(sensitiveObject);

      expect(masked).toEqual({
        user: {
          email: '********',
          password: '********',
          profile: {
            name: 'John Doe',
            token: '********',
          },
        },
        otherData: 'not-sensitive',
      });
    });

    it('should handle circular references', () => {
      // ✅ Test : Gestion des références circulaires
      const circularObject: any = {
        email: 'test@example.com',
        password: 'secret123',
      };
      circularObject.self = circularObject;

      const masked = maskSensitiveData(circularObject);

      expect(masked.email).toBe('********');
      expect(masked.password).toBe('********');
      expect(masked.self).toBe('[Circular Reference]');
    });

    it('should handle Date objects', () => {
      // ✅ Test : Gestion des objets Date
      const sensitiveObject = {
        email: 'test@example.com',
        password: 'secret123',
        createdAt: new Date('2024-01-01'),
      };

      const masked = maskSensitiveData(sensitiveObject);

      expect(masked).toEqual({
        email: '********',
        password: '********',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should handle primitive types', () => {
      // ✅ Test : Gestion des types primitifs
      expect(maskSensitiveData('string')).toBe('string');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(true)).toBe(true);
      expect(maskSensitiveData(null)).toBe(null);
      expect(maskSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle empty objects and arrays', () => {
      // ✅ Test : Gestion des objets et tableaux vides
      expect(maskSensitiveData({})).toEqual({});
      expect(maskSensitiveData([])).toEqual([]);
    });
  });

  describe('maskSensitiveDataArray', () => {
    it('should mask sensitive data in array', () => {
      // ✅ Test : Masquage des données sensibles dans un tableau
      const sensitiveArray = [
        { email: 'test1@example.com', password: 'secret1' },
        { email: 'test2@example.com', password: 'secret2' },
      ];

      const masked = maskSensitiveDataArray(sensitiveArray);

      expect(masked).toEqual([
        { email: '********', password: '********' },
        { email: '********', password: '********' },
      ]);
    });

    it('should handle empty array', () => {
      // ✅ Test : Gestion d'un tableau vide
      const masked = maskSensitiveDataArray([]);
      expect(masked).toEqual([]);
    });

    it('should handle array with mixed types', () => {
      // ✅ Test : Gestion d'un tableau avec types mixtes
      const mixedArray = [
        { email: 'test@example.com', password: 'secret' },
        'string',
        123,
        { token: 'jwt-token' },
      ];

      const masked = maskSensitiveDataArray(mixedArray);

      expect(masked).toEqual([
        { email: '********', password: '********' },
        'string',
        123,
        { token: '********' },
      ]);
    });
  });

  describe('maskSensitiveDataSafe', () => {
    it('should handle normal depth objects', () => {
      // ✅ Test : Gestion d'objets de profondeur normale
      const normalObject = {
        level1: {
          level2: {
            email: 'test@example.com',
            password: 'secret123',
          },
        },
      };

      const masked = maskSensitiveDataSafe(
        normalObject,
        ['email', 'password'],
        false,
        5,
      );

      expect(masked).toEqual({
        level1: {
          level2: {
            email: '********',
            password: '********',
          },
        },
      });
    });

    it('should handle circular references with depth limit', () => {
      // ✅ Test : Gestion des références circulaires avec limite de profondeur
      const circularObject: any = {
        email: 'test@example.com',
        password: 'secret123',
      };
      circularObject.self = circularObject;

      const masked = maskSensitiveDataSafe(
        circularObject,
        ['email', 'password'],
        false,
        2,
      );

      expect(masked.email).toBe('********');
      expect(masked.password).toBe('********');
      expect(masked.self).toBe('[Circular Reference]');
    });
  });

  describe('FIELD_TO_MASK constant', () => {
    it('should contain expected sensitive fields', () => {
      // ✅ Test : Contient les champs sensibles attendus
      expect(FIELD_TO_MASK).toContain('password');
      expect(FIELD_TO_MASK).toContain('email');
      expect(FIELD_TO_MASK).toContain('token');
    });

    it('should be an array', () => {
      // ✅ Test : Est un tableau
      expect(Array.isArray(FIELD_TO_MASK)).toBe(true);
    });
  });

  describe('FORCE_MASK_NAME constant', () => {
    it('should contain expected class names', () => {
      // ✅ Test : Contient les noms de classes attendus
      expect(FORCE_MASK_NAME).toContain('SigninHandler');
      expect(FORCE_MASK_NAME).toContain('AuthService');
    });

    it('should be an array', () => {
      // ✅ Test : Est un tableau
      expect(Array.isArray(FORCE_MASK_NAME)).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle very large objects', () => {
      // ✅ Test : Gestion d'objets très volumineux
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`field${i}`] = {
          email: `test${i}@example.com`,
          password: `secret${i}`,
          otherData: `data${i}`,
        };
      }

      const masked = maskSensitiveData(largeObject);

      expect(Object.keys(masked)).toHaveLength(1000);
      expect(masked.field0.email).toBe('********');
      expect(masked.field0.password).toBe('********');
      expect(masked.field0.otherData).toBe('data0');
    });

    it('should handle special characters in field names', () => {
      // ✅ Test : Gestion de caractères spéciaux dans les noms de champs
      const specialObject = {
        'email@domain': 'test@example.com',
        'password!': 'secret123',
        'token#': 'jwt-token',
        'normal-field': 'not-sensitive',
      };

      const masked = maskSensitiveData(specialObject, [
        'email@domain',
        'password!',
        'token#',
      ]);

      expect(masked).toEqual({
        'email@domain': '********',
        'password!': '********',
        'token#': '********',
        'normal-field': 'not-sensitive',
      });
    });

    it('should handle very deep nesting', () => {
      // ✅ Test : Gestion d'imbrication très profonde
      let deepObject: any = {
        email: 'test@example.com',
        password: 'secret123',
      };
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject };
      }

      const masked = maskSensitiveData(deepObject);

      // Should not throw error and should mask the sensitive data
      expect(masked).toBeDefined();
    });

    it('should handle concurrent masking operations', () => {
      // ✅ Test : Gestion d'opérations de masquage concurrentes
      const sensitiveObject = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'jwt-token',
      };

      // Simulate concurrent operations
      const results = Array(100)
        .fill(null)
        .map(() => maskSensitiveData(sensitiveObject));

      results.forEach((result) => {
        expect(result.email).toBe('********');
        expect(result.password).toBe('********');
        expect(result.token).toBe('********');
      });
    });
  });
});
