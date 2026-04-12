import { normalizeString } from './string.utils';

describe('String Utils', () => {
  describe('normalizeString', () => {
    it('should normalize accented characters', () => {
      // ✅ Test : Normalisation des caractères accentués
      expect(normalizeString('café')).toBe('cafe');
      expect(normalizeString('naïve')).toBe('naive');
      expect(normalizeString('résumé')).toBe('resume');
      expect(normalizeString('piñata')).toBe('pinata');
      expect(normalizeString('jalapeño')).toBe('jalapeno');
    });

    it('should handle multiple accented characters', () => {
      // ✅ Test : Gestion de plusieurs caractères accentués
      expect(normalizeString('café naïve résumé')).toBe('cafe naive resume');
      expect(normalizeString('piñata jalapeño')).toBe('pinata jalapeno');
      expect(normalizeString('café & naïve résumé')).toBe(
        'cafe & naive resume',
      );
    });

    it('should convert to lowercase', () => {
      // ✅ Test : Conversion en minuscules
      expect(normalizeString('CAFÉ')).toBe('cafe');
      expect(normalizeString('NAÏVE')).toBe('naive');
      expect(normalizeString('RÉSUMÉ')).toBe('resume');
      expect(normalizeString('PIÑATA')).toBe('pinata');
    });

    it('should handle mixed case', () => {
      // ✅ Test : Gestion de casse mixte
      expect(normalizeString('Café')).toBe('cafe');
      expect(normalizeString('Naïve')).toBe('naive');
      expect(normalizeString('Résumé')).toBe('resume');
      expect(normalizeString('Piñata')).toBe('pinata');
    });

    it('should handle strings without accents', () => {
      // ✅ Test : Gestion de chaînes sans accents
      expect(normalizeString('hello')).toBe('hello');
      expect(normalizeString('world')).toBe('world');
      expect(normalizeString('test')).toBe('test');
      expect(normalizeString('HELLO')).toBe('hello');
      expect(normalizeString('WORLD')).toBe('world');
    });

    it('should handle empty strings', () => {
      // ✅ Test : Gestion de chaînes vides
      expect(normalizeString('')).toBe('');
    });

    it('should handle whitespace', () => {
      // ✅ Test : Gestion des espaces
      expect(normalizeString('  café  ')).toBe('  cafe  ');
      expect(normalizeString('\tnaïve\n')).toBe('\tnaive\n');
      expect(normalizeString('résumé test')).toBe('resume test');
    });

    it('should handle special characters', () => {
      // ✅ Test : Gestion de caractères spéciaux
      expect(normalizeString('café-naïve')).toBe('cafe-naive');
      expect(normalizeString('résumé_test')).toBe('resume_test');
      expect(normalizeString('piñata@domain.com')).toBe('pinata@domain.com');
      expect(normalizeString('jalapeño#hashtag')).toBe('jalapeno#hashtag');
    });

    it('should handle numbers', () => {
      // ✅ Test : Gestion des nombres
      expect(normalizeString('café123')).toBe('cafe123');
      expect(normalizeString('naïve456')).toBe('naive456');
      expect(normalizeString('résumé789')).toBe('resume789');
    });

    it('should handle punctuation', () => {
      // ✅ Test : Gestion de la ponctuation
      expect(normalizeString('café, naïve!')).toBe('cafe, naive!');
      expect(normalizeString('résumé; test.')).toBe('resume; test.');
      expect(normalizeString('piñata: result?')).toBe('pinata: result?');
    });

    it('should handle various Unicode characters', () => {
      // ✅ Test : Gestion de divers caractères Unicode
      expect(normalizeString('café')).toBe('cafe'); // é -> e
      expect(normalizeString('naïve')).toBe('naive'); // ï -> i
      expect(normalizeString('résumé')).toBe('resume'); // é -> e
      expect(normalizeString('piñata')).toBe('pinata'); // ñ -> n
      expect(normalizeString('jalapeño')).toBe('jalapeno'); // ñ -> n
      expect(normalizeString('café')).toBe('cafe'); // é -> e
      expect(normalizeString('naïve')).toBe('naive'); // ï -> i
    });

    it('should handle complex accented characters', () => {
      // ✅ Test : Gestion de caractères accentués complexes
      expect(normalizeString('café')).toBe('cafe'); // é -> e
      expect(normalizeString('naïve')).toBe('naive'); // ï -> i
      expect(normalizeString('résumé')).toBe('resume'); // é -> e
      expect(normalizeString('piñata')).toBe('pinata'); // ñ -> n
      expect(normalizeString('jalapeño')).toBe('jalapeno'); // ñ -> n
    });

    it('should handle very long strings', () => {
      // ✅ Test : Gestion de chaînes très longues
      const longString = 'café '.repeat(1000);
      const result = normalizeString(longString);
      expect(result).toBe('cafe '.repeat(1000));
    });

    it('should handle strings with only accents', () => {
      // ✅ Test : Gestion de chaînes avec seulement des accents
      expect(normalizeString('é')).toBe('e');
      expect(normalizeString('ï')).toBe('i');
      expect(normalizeString('ñ')).toBe('n');
      expect(normalizeString('éïñ')).toBe('ein');
    });

    it('should handle strings with mixed accents and regular characters', () => {
      // ✅ Test : Gestion de chaînes avec accents et caractères réguliers mixtes
      expect(normalizeString('aéiño')).toBe('aeino');
      expect(normalizeString('éaïoñ')).toBe('eaion');
      expect(normalizeString('abcédef')).toBe('abcedef');
    });

    it('should handle edge cases', () => {
      // ✅ Test : Gestion des cas limites
      expect(normalizeString('a')).toBe('a');
      expect(normalizeString('A')).toBe('a');
      expect(normalizeString('1')).toBe('1');
      expect(normalizeString('!')).toBe('!');
      expect(normalizeString('@')).toBe('@');
      expect(normalizeString('#')).toBe('#');
    });

    it('should handle null and undefined inputs', () => {
      // ✅ Test : Gestion d'entrées null et undefined
      expect(() => normalizeString(null as any)).toThrow();
      expect(() => normalizeString(undefined as any)).toThrow();
    });

    it('should handle non-string inputs', () => {
      // ✅ Test : Gestion d'entrées non-string
      expect(() => normalizeString(123 as any)).toThrow();
      expect(() => normalizeString(true as any)).toThrow();
      expect(() => normalizeString({} as any)).toThrow();
      expect(() => normalizeString([] as any)).toThrow();
    });
  });

  describe('Security considerations', () => {
    it('should handle potential injection attempts', () => {
      // ✅ Test : Gestion des tentatives d'injection potentielles
      const injectionAttempts = [
        'café<script>alert("xss")</script>',
        'naïve<img src="x" onerror="alert(\'xss\')">',
        'résumé; DROP TABLE users;',
        'piñata OR 1=1',
        'jalapeño UNION SELECT * FROM users',
      ];

      injectionAttempts.forEach((attempt) => {
        const result = normalizeString(attempt);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        // Should normalize accents but preserve other characters
        expect(result).not.toContain('é');
        expect(result).not.toContain('ï');
        expect(result).not.toContain('ñ');
      });
    });

    it('should handle very large inputs', () => {
      // ✅ Test : Gestion d'entrées très volumineuses
      const largeInput = 'café'.repeat(10000);
      const result = normalizeString(largeInput);
      expect(result).toBe('cafe'.repeat(10000));
    });

    it('should handle concurrent operations', () => {
      // ✅ Test : Gestion d'opérations concurrentes
      const testStrings = ['café', 'naïve', 'résumé', 'piñata', 'jalapeño'];

      // Simulate concurrent operations
      const results = Array(100)
        .fill(null)
        .map(() => testStrings.map((str) => normalizeString(str)));

      results.forEach((resultSet) => {
        expect(resultSet[0]).toBe('cafe');
        expect(resultSet[1]).toBe('naive');
        expect(resultSet[2]).toBe('resume');
        expect(resultSet[3]).toBe('pinata');
        expect(resultSet[4]).toBe('jalapeno');
      });
    });

    it('should handle Unicode normalization edge cases', () => {
      // ✅ Test : Gestion des cas limites de normalisation Unicode
      // Test with different Unicode representations of the same character
      expect(normalizeString('café')).toBe('cafe'); // é (U+00E9)
      expect(normalizeString('cafe\u0301')).toBe('cafe'); // e + combining acute accent
      expect(normalizeString('naïve')).toBe('naive'); // ï (U+00EF)
      expect(normalizeString('naive\u0308')).toBe('naive'); // i + combining diaeresis
    });

    it('should handle complex Unicode sequences', () => {
      // ✅ Test : Gestion de séquences Unicode complexes
      const complexStrings = [
        'café naïve résumé',
        'piñata jalapeño',
        'café & naïve résumé',
        'piñata@domain.com',
        'jalapeño#hashtag',
      ];

      complexStrings.forEach((str) => {
        const result = normalizeString(str);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        // Should not contain any accented characters
        expect(result).not.toMatch(/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/);
      });
    });
  });
});
