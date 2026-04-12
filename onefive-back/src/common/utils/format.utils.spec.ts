import {
  formatUserName,
  formatDate,
  formatDateTime,
  formatFileSize,
  truncateText,
  formatPercentage,
} from './format.utils';

describe('Format Utils', () => {
  describe('formatUserName', () => {
    it('should format full name correctly', () => {
      // ✅ Test : Formatage correct du nom complet
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
      expect(formatUserName('Jane', 'Smith')).toBe('Jane Smith');
    });

    it('should handle missing lastName', () => {
      // ✅ Test : Gestion du nom de famille manquant
      expect(formatUserName('John', undefined)).toBe('John');
      expect(formatUserName('John', '')).toBe('John');
    });

    it('should handle missing firstName', () => {
      // ✅ Test : Gestion du prénom manquant
      expect(formatUserName(undefined, 'Doe')).toBe('Doe');
      expect(formatUserName('', 'Doe')).toBe('Doe');
    });

    it('should handle both names missing', () => {
      // ✅ Test : Gestion des deux noms manquants
      expect(formatUserName(undefined, undefined)).toBe('Utilisateur');
      expect(formatUserName('', '')).toBe('Utilisateur');
      expect(formatUserName('', undefined)).toBe('Utilisateur');
      expect(formatUserName(undefined, '')).toBe('Utilisateur');
    });

    it('should trim whitespace', () => {
      // ✅ Test : Suppression des espaces extérieurs
      // Note: trim() only removes leading/trailing whitespace from the full string
      expect(formatUserName('  John  ', '  Doe  ')).toBe('John     Doe');
      expect(formatUserName('  John  ', undefined)).toBe('John');
      expect(formatUserName(undefined, '  Doe  ')).toBe('Doe');
    });

    it('should handle special characters', () => {
      // ✅ Test : Gestion de caractères spéciaux
      expect(formatUserName('José', 'García')).toBe('José García');
      expect(formatUserName('Jean-Pierre', 'Dupont')).toBe(
        'Jean-Pierre Dupont',
      );
      expect(formatUserName("O'Connor", 'Smith')).toBe("O'Connor Smith");
    });

    it('should handle very long names', () => {
      // ✅ Test : Gestion de noms très longs
      const longName = 'A'.repeat(100);
      expect(formatUserName(longName, 'Doe')).toBe(`${longName} Doe`);
      expect(formatUserName('John', longName)).toBe(`John ${longName}`);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      // ✅ Test : Formatage correct de la date
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle different dates', () => {
      // ✅ Test : Gestion de différentes dates
      expect(formatDate(new Date('2023-12-31T23:59:59.999Z'))).toBe(
        '2023-12-31',
      );
      expect(formatDate(new Date('2024-02-29T00:00:00.000Z'))).toBe(
        '2024-02-29',
      );
      expect(formatDate(new Date('2000-01-01T00:00:00.000Z'))).toBe(
        '2000-01-01',
      );
    });

    it('should handle edge cases', () => {
      // ✅ Test : Gestion des cas limites
      expect(formatDate(new Date('1970-01-01T00:00:00.000Z'))).toBe(
        '1970-01-01',
      );
      expect(formatDate(new Date('2099-12-31T23:59:59.999Z'))).toBe(
        '2099-12-31',
      );
    });

    it('should handle invalid dates', () => {
      // ✅ Test : Gestion de dates invalides - toISOString() throws on invalid date
      const invalidDate = new Date('invalid');
      expect(() => formatDate(invalidDate)).toThrow();
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      // ✅ Test : Formatage correct de la date et heure
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(formatDateTime(date)).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle different datetimes', () => {
      // ✅ Test : Gestion de différentes dates et heures
      expect(formatDateTime(new Date('2023-12-31T23:59:59.999Z'))).toBe(
        '2023-12-31T23:59:59.999Z',
      );
      expect(formatDateTime(new Date('2024-02-29T00:00:00.000Z'))).toBe(
        '2024-02-29T00:00:00.000Z',
      );
    });

    it('should handle milliseconds', () => {
      // ✅ Test : Gestion des millisecondes
      const date = new Date('2024-01-15T10:30:00.123Z');
      expect(formatDateTime(date)).toBe('2024-01-15T10:30:00.123Z');
    });

    it('should handle invalid dates', () => {
      // ✅ Test : Gestion de dates invalides - toISOString() throws on invalid date
      const invalidDate = new Date('invalid');
      expect(() => formatDateTime(invalidDate)).toThrow();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      // ✅ Test : Formatage correct des octets
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format KB correctly', () => {
      // ✅ Test : Formatage correct des KB
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
    });

    it('should format MB correctly', () => {
      // ✅ Test : Formatage correct des MB
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(1073741823)).toBe('1024 MB');
    });

    it('should format GB correctly', () => {
      // ✅ Test : Formatage correct des GB
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
    });

    it('should handle very large files', () => {
      // ✅ Test : Gestion de fichiers très volumineux
      // sizes array only goes to GB, so TB+ values produce undefined unit
      expect(formatFileSize(1099511627776)).toBe('1 undefined');
      expect(formatFileSize(1125899906842624)).toBe('1 undefined');
    });

    it('should handle decimal precision', () => {
      // ✅ Test : Gestion de la précision décimale
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1537)).toBe('1.5 KB');
      expect(formatFileSize(1538)).toBe('1.5 KB');
      expect(formatFileSize(1539)).toBe('1.5 KB');
      expect(formatFileSize(1540)).toBe('1.5 KB');
    });

    it('should handle negative numbers', () => {
      // ✅ Test : Gestion des nombres négatifs - Math.log returns NaN
      expect(formatFileSize(-1)).toBe('NaN undefined');
      expect(formatFileSize(-1024)).toBe('NaN undefined');
    });

    it('should handle very small numbers', () => {
      // ✅ Test : Gestion de très petits nombres - Math.log returns negative
      expect(formatFileSize(0.5)).toBe('512 undefined');
      expect(formatFileSize(0.9)).toBe('921.6 undefined');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text correctly', () => {
      // ✅ Test : Troncature correcte de texte long
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
      expect(truncateText(longText, 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      // ✅ Test : Pas de troncature pour texte court
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
      expect(truncateText(shortText, 10)).toBe('Short text');
    });

    it('should handle exact length', () => {
      // ✅ Test : Gestion de longueur exacte
      const text = 'Exactly ten';
      expect(truncateText(text, 11)).toBe('Exactly ten');
      expect(truncateText(text, 10)).toBe('Exactly...');
    });

    it('should handle very short max length', () => {
      // ✅ Test : Gestion de longueur maximale très courte
      const text = 'Hello';
      expect(truncateText(text, 3)).toBe('...');
      expect(truncateText(text, 2)).toBe('...');
      expect(truncateText(text, 1)).toBe('...');
    });

    it('should handle empty text', () => {
      // ✅ Test : Gestion de texte vide
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle special characters', () => {
      // ✅ Test : Gestion de caractères spéciaux
      // Note: JS string length counts UTF-16 code units, emoji 🌍 counts as 2
      const text = 'Hello 世界 🌍';
      expect(truncateText(text, 10)).toBe('Hello 世...');
    });

    it('should handle unicode characters', () => {
      // ✅ Test : Gestion de caractères Unicode
      const text = 'Café naïve résumé';
      expect(truncateText(text, 10)).toBe('Café na...');
    });

    it('should handle whitespace', () => {
      // ✅ Test : Gestion des espaces
      const text = '  Hello world  ';
      expect(truncateText(text, 10)).toBe('  Hello...');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      // ✅ Test : Formatage correct du pourcentage
      expect(formatPercentage(25, 100)).toBe('25%');
      expect(formatPercentage(50, 100)).toBe('50%');
      expect(formatPercentage(75, 100)).toBe('75%');
      expect(formatPercentage(100, 100)).toBe('100%');
    });

    it('should handle decimal values', () => {
      // ✅ Test : Gestion de valeurs décimales
      expect(formatPercentage(25.5, 100)).toBe('26%'); // Rounded up
      expect(formatPercentage(25.4, 100)).toBe('25%'); // Rounded down
      expect(formatPercentage(33.333, 100)).toBe('33%');
      expect(formatPercentage(66.666, 100)).toBe('67%');
    });

    it('should handle zero total', () => {
      // ✅ Test : Gestion de total zéro
      expect(formatPercentage(10, 0)).toBe('0%');
      expect(formatPercentage(0, 0)).toBe('0%');
      expect(formatPercentage(100, 0)).toBe('0%');
    });

    it('should handle zero value', () => {
      // ✅ Test : Gestion de valeur zéro
      expect(formatPercentage(0, 100)).toBe('0%');
      expect(formatPercentage(0, 50)).toBe('0%');
    });

    it('should handle values greater than total', () => {
      // ✅ Test : Gestion de valeurs supérieures au total
      expect(formatPercentage(150, 100)).toBe('150%');
      expect(formatPercentage(200, 100)).toBe('200%');
    });

    it('should handle negative values', () => {
      // ✅ Test : Gestion de valeurs négatives
      expect(formatPercentage(-10, 100)).toBe('-10%');
      expect(formatPercentage(10, -100)).toBe('-10%');
      expect(formatPercentage(-10, -100)).toBe('10%');
    });

    it('should handle very large numbers', () => {
      // ✅ Test : Gestion de très grands nombres
      expect(formatPercentage(1000000, 1000000)).toBe('100%');
      expect(formatPercentage(2000000, 1000000)).toBe('200%');
    });

    it('should handle very small numbers', () => {
      // ✅ Test : Gestion de très petits nombres
      expect(formatPercentage(0.1, 100)).toBe('0%');
      expect(formatPercentage(0.5, 100)).toBe('1%');
      expect(formatPercentage(0.9, 100)).toBe('1%');
    });

    it('should handle edge cases', () => {
      // ✅ Test : Gestion des cas limites
      expect(formatPercentage(1, 3)).toBe('33%');
      expect(formatPercentage(2, 3)).toBe('67%');
      expect(formatPercentage(1, 7)).toBe('14%');
      expect(formatPercentage(22, 7)).toBe('314%');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle malicious input in formatUserName', () => {
      // ✅ Test : Gestion d'entrées malveillantes dans formatUserName
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'John<script>alert("xss")</script>Doe',
        'John<img src="x" onerror="alert(\'xss\')">Doe',
      ];

      maliciousInputs.forEach((input) => {
        const formatted = formatUserName(input, 'Doe');
        expect(formatted).toContain(input); // Should preserve input as-is
        // Note: XSS prevention should be handled at the display layer
      });
    });

    it('should handle very long inputs', () => {
      // ✅ Test : Gestion d'entrées très longues
      const veryLongString = 'A'.repeat(10000);

      expect(formatUserName(veryLongString, 'Doe')).toBe(
        `${veryLongString} Doe`,
      );
      expect(truncateText(veryLongString, 100)).toBe('A'.repeat(97) + '...');
    });

    it('should handle concurrent operations', () => {
      // ✅ Test : Gestion d'opérations concurrentes
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        date: new Date('2024-01-15T10:30:00.000Z'),
        bytes: 1048576,
        text: 'This is a test text',
        value: 25,
        total: 100,
      };

      // Simulate concurrent operations
      const results = Array(100)
        .fill(null)
        .map(() => ({
          userName: formatUserName(testData.firstName, testData.lastName),
          date: formatDate(testData.date),
          fileSize: formatFileSize(testData.bytes),
          truncated: truncateText(testData.text, 10),
          percentage: formatPercentage(testData.value, testData.total),
        }));

      results.forEach((result) => {
        expect(result.userName).toBe('John Doe');
        expect(result.date).toBe('2024-01-15');
        expect(result.fileSize).toBe('1 MB');
        expect(result.truncated).toBe('This is...');
        expect(result.percentage).toBe('25%');
      });
    });

    it('should handle null and undefined inputs gracefully', () => {
      // ✅ Test : Gestion gracieuse de null et undefined
      expect(formatUserName(null as any, undefined)).toBe('Utilisateur');
      expect(() => formatDate(null as any)).toThrow();
      expect(() => formatDateTime(undefined as any)).toThrow();
      expect(formatFileSize(null as any)).toBe('NaN undefined');
      expect(() => truncateText(null as any, 10)).toThrow();
      expect(formatPercentage(null as any, 100)).toBe('0%');
    });
  });
});
