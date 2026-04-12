import {
  validateImageFile,
  validateImageFileOrThrow,
  DEFAULT_IMAGE_CONFIG,
  IMAGE_VALIDATION_PRESETS,
  type ImageValidationConfig,
} from './image-validation.utils';

describe('Image Validation Utils', () => {
  const createMockFile = (
    overrides: Partial<Express.Multer.File> = {},
  ): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    destination: '/tmp',
    filename: 'test-image.jpg',
    path: '/tmp/test-image.jpg',
    buffer: Buffer.from('fake-image-data'),
    stream: null as any,
    ...overrides,
  });

  describe('validateImageFile', () => {
    it('should validate a valid image file', () => {
      const file = createMockFile();
      const result = validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid MIME type', () => {
      const file = createMockFile({ mimetype: 'text/plain' });
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid MIME type');
      expect(result.errors[0]).toContain('text/plain');
    });

    it('should reject file that is too large', () => {
      const file = createMockFile({ size: 15 * 1024 * 1024 }); // 15MB
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('File size too large');
    });

    it('should reject file with invalid filename', () => {
      const file = createMockFile({ originalname: '' });
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid filename');
    });

    it('should reject file with filename too long', () => {
      const longFilename = 'a'.repeat(300) + '.jpg';
      const file = createMockFile({ originalname: longFilename });
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid filename');
    });

    it('should accumulate multiple errors', () => {
      const file = createMockFile({
        mimetype: 'text/plain',
        size: 15 * 1024 * 1024, // 15MB
        originalname: '',
      });
      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Invalid MIME type');
      expect(result.errors[1]).toContain('File size too large');
      expect(result.errors[2]).toContain('Invalid filename');
    });

    it('should use custom configuration', () => {
      const customConfig: ImageValidationConfig = {
        allowedMimeTypes: ['image/png'],
        maxSize: 500 * 1024, // 500KB
        maxFilenameLength: 50,
      };

      const file = createMockFile({
        mimetype: 'image/jpeg', // Not allowed in custom config
        size: 1024 * 1024, // 1MB, exceeds custom limit
      });

      const result = validateImageFile(file, customConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Invalid MIME type');
      expect(result.errors[1]).toContain('File size too large');
    });

    it('should validate all allowed MIME types', () => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];

      allowedTypes.forEach((mimetype) => {
        const file = createMockFile({ mimetype });
        const result = validateImageFile(file);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('validateImageFileOrThrow', () => {
    it('should not throw for valid file', () => {
      const file = createMockFile();
      const throwException = jest.fn();

      expect(() => {
        validateImageFileOrThrow(file, {}, throwException as any);
      }).not.toThrow();

      expect(throwException).not.toHaveBeenCalled();
    });

    it('should throw for invalid file', () => {
      const file = createMockFile({ mimetype: 'text/plain' });
      const throwException = jest.fn(() => {
        throw new Error('Validation failed');
      });

      expect(() => {
        validateImageFileOrThrow(file, {}, throwException as any);
      }).toThrow('Validation failed');

      expect(throwException).toHaveBeenCalledWith([
        expect.stringContaining('Invalid MIME type'),
      ]);
    });

    it('should pass all errors to exception function', () => {
      const file = createMockFile({
        mimetype: 'text/plain',
        size: 15 * 1024 * 1024,
      });
      const throwException = jest.fn(() => {
        throw new Error('Multiple validation errors');
      });

      expect(() => {
        validateImageFileOrThrow(file, {}, throwException as any);
      }).toThrow('Multiple validation errors');

      expect(throwException).toHaveBeenCalledWith([
        expect.stringContaining('Invalid MIME type'),
        expect.stringContaining('File size too large'),
      ]);
    });
  });

  describe('DEFAULT_IMAGE_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_IMAGE_CONFIG.allowedMimeTypes).toEqual([
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ]);
      expect(DEFAULT_IMAGE_CONFIG.maxSize).toBe(10 * 1024 * 1024); // 10MB
      expect(DEFAULT_IMAGE_CONFIG.maxFilenameLength).toBe(255);
    });
  });

  describe('IMAGE_VALIDATION_PRESETS', () => {
    it('should have AVATAR preset with correct values', () => {
      expect(IMAGE_VALIDATION_PRESETS.AVATAR.maxSize).toBe(5 * 1024 * 1024); // 5MB
      expect(IMAGE_VALIDATION_PRESETS.AVATAR.allowedMimeTypes).toEqual(
        DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
      );
      expect(IMAGE_VALIDATION_PRESETS.AVATAR.maxFilenameLength).toBe(255);
    });

    it('should have COVER preset with correct values', () => {
      expect(IMAGE_VALIDATION_PRESETS.COVER.maxSize).toBe(10 * 1024 * 1024); // 10MB
      expect(IMAGE_VALIDATION_PRESETS.COVER.allowedMimeTypes).toEqual(
        DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
      );
      expect(IMAGE_VALIDATION_PRESETS.COVER.maxFilenameLength).toBe(255);
    });

    it('should have POST_MEDIA preset with correct values', () => {
      expect(IMAGE_VALIDATION_PRESETS.POST_MEDIA.maxSize).toBe(
        15 * 1024 * 1024,
      ); // 15MB
      expect(IMAGE_VALIDATION_PRESETS.POST_MEDIA.allowedMimeTypes).toEqual(
        DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
      );
      expect(IMAGE_VALIDATION_PRESETS.POST_MEDIA.maxFilenameLength).toBe(255);
    });

    it('should validate files with preset configurations', () => {
      // Test AVATAR preset
      const avatarFile = createMockFile({ size: 4 * 1024 * 1024 }); // 4MB
      const avatarResult = validateImageFile(
        avatarFile,
        IMAGE_VALIDATION_PRESETS.AVATAR,
      );
      expect(avatarResult.isValid).toBe(true);

      // Test file too large for AVATAR but valid for COVER
      const largeFile = createMockFile({ size: 8 * 1024 * 1024 }); // 8MB
      const avatarLargeResult = validateImageFile(
        largeFile,
        IMAGE_VALIDATION_PRESETS.AVATAR,
      );
      expect(avatarLargeResult.isValid).toBe(false);

      const coverLargeResult = validateImageFile(
        largeFile,
        IMAGE_VALIDATION_PRESETS.COVER,
      );
      expect(coverLargeResult.isValid).toBe(true);
    });
  });
});
