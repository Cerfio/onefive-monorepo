import {
  isValidUUID,
  isValidEmail,
  sanitizeInput,
  isValidLength,
  validateTags,
} from './validation.utils';

describe('Validation Utils', () => {
  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      // ✅ Test : Validation d'UUIDs corrects
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
      ];

      validUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      // ✅ Test : Rejet d'UUIDs invalides
      const invalidUUIDs = [
        '123e4567-e89b-12d3-a456-42661417400', // Too short
        '123e4567-e89b-12d3-a456-4266141740000', // Too long
        '123e4567-e89b-12d3-a456-42661417400g', // Invalid character
        '123e4567-e89b-12d3-a456-42661417400G', // Invalid character
        '123e4567-e89b-12d3-a456-42661417400-', // Extra dash
        '123e4567-e89b-12d3-a456-42661417400', // Missing dash
        '123e4567e89b12d3a456426614174000', // No dashes
        '123e4567-e89b-12d3-a456-42661417400x', // Invalid version
        '123e4567-e89b-12d3-a456-42661417400z', // Invalid variant
        '', // Empty string
        'not-a-uuid', // Not a UUID
        '123e4567-e89b-12d3-a456', // Incomplete
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });

    it('should handle case sensitivity', () => {
      // ✅ Test : Gestion de la sensibilité à la casse
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const upperCaseUUID = uuid.toUpperCase();
      const lowerCaseUUID = uuid.toLowerCase();

      expect(isValidUUID(upperCaseUUID)).toBe(true);
      expect(isValidUUID(lowerCaseUUID)).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      // ✅ Test : Validation d'adresses email correctes
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co',
        'user@sub.domain.com',
        'user@domain.info',
        'user@domain.museum',
        'user@domain.name',
        'user@domain.travel',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should handle special characters in email', () => {
      // ✅ Test : Gestion de caractères spéciaux dans l'email
      const specialEmails = [
        'test+tag@example.com',
        'user.name@domain.co.uk',
        'user_name@example.org',
        'user-name@test-domain.com',
        'user123@test123.com',
        'user@test-domain.com',
      ];

      specialEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should handle very long email addresses', () => {
      // ✅ Test : Gestion d'adresses email très longues
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      expect(isValidEmail(longEmail)).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      // ✅ Test : Suppression des chevrons
      expect(sanitizeInput('Hello <world>')).toBe('Hello world');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script',
      );
      expect(sanitizeInput('Normal text')).toBe('Normal text');
    });

    it('should trim whitespace', () => {
      // ✅ Test : Suppression des espaces en début/fin
      expect(sanitizeInput('  Hello world  ')).toBe('Hello world');
      expect(sanitizeInput('\t\nHello world\t\n')).toBe('Hello world');
      expect(sanitizeInput('   ')).toBe('');
    });

    it('should handle empty strings', () => {
      // ✅ Test : Gestion des chaînes vides
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });

    it('should handle special characters', () => {
      // ✅ Test : Gestion de caractères spéciaux
      expect(sanitizeInput('Hello & world!')).toBe('Hello & world!');
      expect(sanitizeInput('Hello "world"')).toBe('Hello "world"');
      expect(sanitizeInput("Hello 'world'")).toBe("Hello 'world'");
    });

    it('should handle XSS attempts', () => {
      // ✅ Test : Gestion des tentatives XSS
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(\'xss\')">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<svg onload="alert(\'xss\')"></svg>',
        '<div onclick="alert(\'xss\')">Click me</div>',
      ];

      xssAttempts.forEach((attempt) => {
        const sanitized = sanitizeInput(attempt);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });
  });

  describe('isValidLength', () => {
    it('should validate correct lengths', () => {
      // ✅ Test : Validation de longueurs correctes
      expect(isValidLength('Hello', 3, 10)).toBe(true);
      expect(isValidLength('Hello world', 5, 15)).toBe(true);
      expect(isValidLength('A', 1, 1)).toBe(true);
      expect(isValidLength('', 0, 0)).toBe(true);
    });

    it('should reject incorrect lengths', () => {
      // ✅ Test : Rejet de longueurs incorrectes
      expect(isValidLength('Hi', 3, 10)).toBe(false); // Too short
      expect(isValidLength('Hello world', 3, 5)).toBe(false); // Too long
      expect(isValidLength('', 1, 10)).toBe(false); // Too short
    });

    it('should handle whitespace correctly', () => {
      // ✅ Test : Gestion correcte des espaces
      expect(isValidLength('  Hello  ', 3, 10)).toBe(true); // Trimmed length is 5
      expect(isValidLength('   ', 0, 0)).toBe(true); // Trimmed length is 0
      expect(isValidLength('  Hello  ', 3, 5)).toBe(true); // Trimmed length is 5
    });

    it('should handle edge cases', () => {
      // ✅ Test : Gestion des cas limites
      expect(isValidLength('A', 0, 1)).toBe(true);
      expect(isValidLength('AB', 0, 1)).toBe(false);
      expect(isValidLength('', 0, 0)).toBe(true);
      expect(isValidLength(' ', 0, 0)).toBe(true); // Trimmed to empty
    });
  });

  describe('validateTags', () => {
    it('should validate correct tags', () => {
      // ✅ Test : Validation de tags corrects
      const validTags = [
        ['tag1', 'tag2', 'tag3'],
        ['single-tag'],
        ['tag-with-hyphens', 'tag_with_underscores', 'tag123'],
        ['a', 'b', 'c', 'd', 'e'], // Max 5 tags
      ];

      validTags.forEach((tags) => {
        expect(validateTags(tags)).toBe(true);
      });
    });

    it('should reject invalid tags', () => {
      // ✅ Test : Rejet de tags invalides
      const invalidTags = [
        ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'], // Too many tags
        [], // Empty array
        [''], // Empty string
        ['tag1', ''], // Contains empty string
        ['tag1', '   '], // Contains only whitespace
        ['a'.repeat(51)], // Too long
        ['tag1', 'a'.repeat(51)], // One tag too long
      ];

      invalidTags.forEach((tags) => {
        expect(validateTags(tags)).toBe(false);
      });
    });

    it('should handle custom max tags limit', () => {
      // ✅ Test : Gestion de limite personnalisée de tags
      expect(validateTags(['tag1', 'tag2'], 2)).toBe(true);
      expect(validateTags(['tag1', 'tag2', 'tag3'], 2)).toBe(false);
      expect(validateTags(['tag1'], 10)).toBe(true);
    });

    it('should handle whitespace in tags', () => {
      // ✅ Test : Gestion des espaces dans les tags
      expect(validateTags(['  tag1  ', '  tag2  '])).toBe(true);
      expect(validateTags(['tag1', '   '])).toBe(false); // Whitespace-only tag
    });

    it('should handle special characters in tags', () => {
      // ✅ Test : Gestion de caractères spéciaux dans les tags
      const specialTags = [
        ['tag-with-hyphens'],
        ['tag_with_underscores'],
        ['tag123'],
        ['tag.with.dots'],
        ['tag@with@symbols'],
        ['tag#with#hashtags'],
      ];

      specialTags.forEach((tags) => {
        expect(validateTags(tags)).toBe(true);
      });
    });

    it('should handle non-array inputs', () => {
      // ✅ Test : Gestion d'entrées non-tableaux
      expect(validateTags('not-an-array' as any)).toBe(false);
      expect(validateTags(123 as any)).toBe(false);
      expect(validateTags({} as any)).toBe(false);
    });

    it('should handle mixed types in array', () => {
      // ✅ Test : Gestion de types mixtes dans le tableau
      expect(validateTags(['tag1', 123 as any, 'tag2'])).toBe(false);
      expect(validateTags(['tag1', null as any, 'tag2'])).toBe(false);
      expect(validateTags(['tag1', undefined as any, 'tag2'])).toBe(false);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle very long inputs', () => {
      // ✅ Test : Gestion d'entrées très longues
      const longString = 'a'.repeat(10000);

      expect(isValidLength(longString, 0, 10000)).toBe(true);
      expect(isValidLength(longString, 0, 9999)).toBe(false);
      expect(sanitizeInput(longString)).toBe(longString);
    });

    it('should handle unicode characters', () => {
      // ✅ Test : Gestion de caractères Unicode
      const unicodeString = 'Hello 世界 🌍';

      expect(isValidLength(unicodeString, 5, 20)).toBe(true);
      expect(sanitizeInput(unicodeString)).toBe(unicodeString);
    });

    it('should handle SQL injection attempts', () => {
      // ✅ Test : Gestion des tentatives d'injection SQL
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM users --",
      ];

      sqlInjectionAttempts.forEach((attempt) => {
        const sanitized = sanitizeInput(attempt);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        // Note: This is basic sanitization, proper SQL injection prevention
        // should be handled at the database layer with parameterized queries
      });
    });

    it('should handle concurrent validation operations', () => {
      // ✅ Test : Gestion d'opérations de validation concurrentes
      const testData = [
        'test@example.com',
        '123e4567-e89b-12d3-a456-426614174000',
        'Hello world',
        ['tag1', 'tag2', 'tag3'],
      ];

      // Simulate concurrent operations
      const results = Array(100)
        .fill(null)
        .map(() => ({
          email: isValidEmail(testData[0] as string),
          uuid: isValidUUID(testData[1] as string),
          length: isValidLength(testData[2] as string, 5, 15),
          tags: validateTags(testData[3] as string[]),
        }));

      results.forEach((result) => {
        expect(result.email).toBe(true);
        expect(result.uuid).toBe(true);
        expect(result.length).toBe(true);
        expect(result.tags).toBe(true);
      });
    });
  });
});
