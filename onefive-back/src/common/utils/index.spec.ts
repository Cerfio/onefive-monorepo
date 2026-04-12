import {
  // String utilities
  normalizeString,

  // Search utilities
  processSearchQuery,

  // Security utilities
  maskSensitiveData,
  maskSensitiveDataArray,
  maskSensitiveDataSafe,
  FIELD_TO_MASK,
  FORCE_MASK_NAME,

  // Validation utilities
  isValidUUID,
  isValidEmail,
  sanitizeInput,
  isValidLength,
  validateTags,

  // Format utilities
  formatUserName,
  formatDate,
  formatDateTime,
  formatFileSize,
  truncateText,
  formatPercentage,
} from './index';

describe('Utils Index', () => {
  describe('exports', () => {
    it('should export all string utilities', () => {
      // ✅ Test : Export de tous les utilitaires de chaînes
      expect(typeof normalizeString).toBe('function');
    });

    it('should export all search utilities', () => {
      // ✅ Test : Export de tous les utilitaires de recherche
      expect(typeof processSearchQuery).toBe('function');
    });

    it('should export all security utilities', () => {
      // ✅ Test : Export de tous les utilitaires de sécurité
      expect(typeof maskSensitiveData).toBe('function');
      expect(typeof maskSensitiveDataArray).toBe('function');
      expect(typeof maskSensitiveDataSafe).toBe('function');
      expect(Array.isArray(FIELD_TO_MASK)).toBe(true);
      expect(Array.isArray(FORCE_MASK_NAME)).toBe(true);
    });

    it('should export all validation utilities', () => {
      // ✅ Test : Export de tous les utilitaires de validation
      expect(typeof isValidUUID).toBe('function');
      expect(typeof isValidEmail).toBe('function');
      expect(typeof sanitizeInput).toBe('function');
      expect(typeof isValidLength).toBe('function');
      expect(typeof validateTags).toBe('function');
    });

    it('should export all format utilities', () => {
      // ✅ Test : Export de tous les utilitaires de formatage
      expect(typeof formatUserName).toBe('function');
      expect(typeof formatDate).toBe('function');
      expect(typeof formatDateTime).toBe('function');
      expect(typeof formatFileSize).toBe('function');
      expect(typeof truncateText).toBe('function');
      expect(typeof formatPercentage).toBe('function');
    });
  });

  describe('integration tests', () => {
    it('should work together for user data processing', () => {
      // ✅ Test : Fonctionnement ensemble pour le traitement de données utilisateur
      const userData = {
        firstName: 'José',
        lastName: 'García',
        email: 'jose.garcia@example.com',
        password: 'secret123',
        tags: ['developer', 'javascript', 'react'],
      };

      // Normalize name
      const normalizedFirstName = normalizeString(userData.firstName);
      const normalizedLastName = normalizeString(userData.lastName);

      // Format full name
      const fullName = formatUserName(normalizedFirstName, normalizedLastName);

      // Validate email
      const isEmailValid = isValidEmail(userData.email);

      // Validate tags
      const areTagsValid = validateTags(userData.tags);

      // Mask sensitive data
      const maskedData = maskSensitiveData(userData);

      expect(normalizedFirstName).toBe('jose');
      expect(normalizedLastName).toBe('garcia');
      expect(fullName).toBe('jose garcia');
      expect(isEmailValid).toBe(true);
      expect(areTagsValid).toBe(true);
      expect(maskedData.email).toBe('********');
      expect(maskedData.password).toBe('********');
      expect(maskedData.firstName).toBe('José');
      expect(maskedData.lastName).toBe('García');
    });

    it('should work together for file processing', () => {
      // ✅ Test : Fonctionnement ensemble pour le traitement de fichiers
      const fileData = {
        name: 'résumé.pdf',
        size: 1048576,
        uploadDate: new Date('2024-01-15T10:30:00.000Z'),
        tags: ['document', 'pdf', 'résumé'],
      };

      // Normalize filename
      const normalizedName = normalizeString(fileData.name);

      // Format file size
      const formattedSize = formatFileSize(fileData.size);

      // Format date
      const formattedDate = formatDate(fileData.uploadDate);

      // Validate tags
      const areTagsValid = validateTags(fileData.tags);

      // Mask sensitive data
      const maskedData = maskSensitiveData(fileData);

      expect(normalizedName).toBe('resume.pdf');
      expect(formattedSize).toBe('1 MB');
      expect(formattedDate).toBe('2024-01-15');
      expect(areTagsValid).toBe(true);
      expect(maskedData.name).toBe('résumé.pdf');
      expect(maskedData.size).toBe(1048576);
    });
  });

  describe('constants', () => {
    it('should have correct FIELD_TO_MASK values', () => {
      // ✅ Test : Valeurs correctes de FIELD_TO_MASK
      expect(FIELD_TO_MASK).toContain('password');
      expect(FIELD_TO_MASK).toContain('email');
      expect(FIELD_TO_MASK).toContain('token');
      expect(Array.isArray(FIELD_TO_MASK)).toBe(true);
    });

    it('should have correct FORCE_MASK_NAME values', () => {
      // ✅ Test : Valeurs correctes de FORCE_MASK_NAME
      expect(FORCE_MASK_NAME).toContain('SigninHandler');
      expect(FORCE_MASK_NAME).toContain('AuthService');
      expect(Array.isArray(FORCE_MASK_NAME)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully across utilities', () => {
      // ✅ Test : Gestion gracieuse des erreurs à travers les utilitaires
      const invalidData = {
        email: null,
        password: undefined,
        name: 123,
        tags: 'not-an-array',
      };

      // These should not throw errors
      expect(() => maskSensitiveData(invalidData)).not.toThrow();
      expect(() => isValidEmail(invalidData.email)).not.toThrow();
      expect(() => validateTags(invalidData.tags as any)).not.toThrow();
      expect(() =>
        formatUserName(invalidData.name as any, 'Doe'),
      ).not.toThrow();
    });
  });
});
