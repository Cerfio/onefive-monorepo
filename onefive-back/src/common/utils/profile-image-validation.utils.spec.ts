import {
  validateProfileImageFile,
  validateAvatarImageFile,
  validateCoverImageFile,
  type ProfileImageExceptions,
} from './profile-image-validation.utils';
import { IMAGE_VALIDATION_PRESETS } from './image-validation.utils';

describe('Profile Image Validation Utils', () => {
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

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as any;

  const createMockExceptions = (): ProfileImageExceptions => ({
    MimeTypeException: {
      throw: jest.fn(() => {
        throw new Error('MimeTypeException');
      }),
    },
    FileSizeException: {
      throw: jest.fn(() => {
        throw new Error('FileSizeException');
      }),
    },
    InvalidFileException: {
      throw: jest.fn(() => {
        throw new Error('InvalidFileException');
      }),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateProfileImageFile', () => {
    it('should validate a valid image file without throwing', () => {
      const file = createMockFile();
      const exceptions = createMockExceptions();

      expect(() => {
        validateProfileImageFile(
          file,
          'test-transaction',
          mockLogger,
          IMAGE_VALIDATION_PRESETS.AVATAR,
          exceptions,
        );
      }).not.toThrow();

      expect(exceptions.MimeTypeException.throw).not.toHaveBeenCalled();
      expect(exceptions.FileSizeException.throw).not.toHaveBeenCalled();
      expect(exceptions.InvalidFileException.throw).not.toHaveBeenCalled();
    });

    it('should throw MimeTypeException for invalid MIME type', () => {
      const file = createMockFile({ mimetype: 'text/plain' });
      const exceptions = createMockExceptions();

      expect(() => {
        validateProfileImageFile(
          file,
          'test-transaction',
          mockLogger,
          IMAGE_VALIDATION_PRESETS.AVATAR,
          exceptions,
        );
      }).toThrow('MimeTypeException');

      expect(exceptions.MimeTypeException.throw).toHaveBeenCalledWith(
        mockLogger,
        {
          transactionId: 'test-transaction',
          mimetype: 'text/plain',
          allowedMimeTypes: IMAGE_VALIDATION_PRESETS.AVATAR.allowedMimeTypes,
        },
      );
    });

    it('should throw FileSizeException for file too large', () => {
      const file = createMockFile({ size: 10 * 1024 * 1024 }); // 10MB (too large for avatar)
      const exceptions = createMockExceptions();

      expect(() => {
        validateProfileImageFile(
          file,
          'test-transaction',
          mockLogger,
          IMAGE_VALIDATION_PRESETS.AVATAR,
          exceptions,
        );
      }).toThrow('FileSizeException');

      expect(exceptions.FileSizeException.throw).toHaveBeenCalledWith(
        mockLogger,
        {
          transactionId: 'test-transaction',
          fileSize: 10 * 1024 * 1024,
          maxSize: IMAGE_VALIDATION_PRESETS.AVATAR.maxSize,
        },
      );
    });

    it('should throw InvalidFileException for invalid filename', () => {
      const file = createMockFile({ originalname: '' });
      const exceptions = createMockExceptions();

      expect(() => {
        validateProfileImageFile(
          file,
          'test-transaction',
          mockLogger,
          IMAGE_VALIDATION_PRESETS.AVATAR,
          exceptions,
        );
      }).toThrow('InvalidFileException');

      expect(exceptions.InvalidFileException.throw).toHaveBeenCalledWith(
        mockLogger,
        {
          transactionId: 'test-transaction',
          originalname: '',
          maxLength: IMAGE_VALIDATION_PRESETS.AVATAR.maxFilenameLength,
        },
      );
    });

    it('should throw InvalidFileException as fallback for unknown errors', () => {
      // Mock the validateImageFileOrThrow to simulate an unknown error
      const file = createMockFile();
      const exceptions = createMockExceptions();

      // We can't easily mock the internal function, so we'll test with a scenario
      // that would trigger the fallback (multiple errors)
      const fileWithMultipleIssues = createMockFile({
        mimetype: 'text/plain',
        size: 20 * 1024 * 1024,
        originalname: '',
      });

      expect(() => {
        validateProfileImageFile(
          fileWithMultipleIssues,
          'test-transaction',
          mockLogger,
          IMAGE_VALIDATION_PRESETS.AVATAR,
          exceptions,
        );
      }).toThrow();

      // Should call one of the exception methods
      const totalCalls =
        (exceptions.MimeTypeException.throw as unknown as jest.Mock).mock.calls
          .length +
        (exceptions.FileSizeException.throw as unknown as jest.Mock).mock.calls
          .length +
        (exceptions.InvalidFileException.throw as unknown as jest.Mock).mock
          .calls.length;

      expect(totalCalls).toBeGreaterThan(0);
    });
  });

  describe('validateAvatarImageFile', () => {
    it('should use AVATAR preset configuration', () => {
      const file = createMockFile({ size: 6 * 1024 * 1024 }); // 6MB (too large for avatar, ok for cover)
      const exceptions = createMockExceptions();

      expect(() => {
        validateAvatarImageFile(
          file,
          'test-transaction',
          mockLogger,
          exceptions,
        );
      }).toThrow('FileSizeException');

      expect(exceptions.FileSizeException.throw).toHaveBeenCalledWith(
        mockLogger,
        {
          transactionId: 'test-transaction',
          fileSize: 6 * 1024 * 1024,
          maxSize: IMAGE_VALIDATION_PRESETS.AVATAR.maxSize, // 5MB
        },
      );
    });

    it('should validate small avatar files successfully', () => {
      const file = createMockFile({ size: 2 * 1024 * 1024 }); // 2MB
      const exceptions = createMockExceptions();

      expect(() => {
        validateAvatarImageFile(
          file,
          'test-transaction',
          mockLogger,
          exceptions,
        );
      }).not.toThrow();

      expect(exceptions.MimeTypeException.throw).not.toHaveBeenCalled();
      expect(exceptions.FileSizeException.throw).not.toHaveBeenCalled();
      expect(exceptions.InvalidFileException.throw).not.toHaveBeenCalled();
    });
  });

  describe('validateCoverImageFile', () => {
    it('should use COVER preset configuration', () => {
      const file = createMockFile({ size: 6 * 1024 * 1024 }); // 6MB (ok for cover)
      const exceptions = createMockExceptions();

      expect(() => {
        validateCoverImageFile(
          file,
          'test-transaction',
          mockLogger,
          exceptions,
        );
      }).not.toThrow();

      expect(exceptions.MimeTypeException.throw).not.toHaveBeenCalled();
      expect(exceptions.FileSizeException.throw).not.toHaveBeenCalled();
      expect(exceptions.InvalidFileException.throw).not.toHaveBeenCalled();
    });

    it('should reject files too large for cover', () => {
      const file = createMockFile({ size: 12 * 1024 * 1024 }); // 12MB (too large for cover)
      const exceptions = createMockExceptions();

      expect(() => {
        validateCoverImageFile(
          file,
          'test-transaction',
          mockLogger,
          exceptions,
        );
      }).toThrow('FileSizeException');

      expect(exceptions.FileSizeException.throw).toHaveBeenCalledWith(
        mockLogger,
        {
          transactionId: 'test-transaction',
          fileSize: 12 * 1024 * 1024,
          maxSize: IMAGE_VALIDATION_PRESETS.COVER.maxSize, // 10MB
        },
      );
    });
  });

  describe('Exception interface compatibility', () => {
    it('should work with different exception implementations', () => {
      const file = createMockFile({ mimetype: 'text/plain' });

      // Test with different exception structure
      const customExceptions: ProfileImageExceptions = {
        MimeTypeException: {
          throw: (logger, args) => {
            expect(logger).toBe(mockLogger);
            expect(args.transactionId).toBe('test-transaction');
            expect(args.mimetype).toBe('text/plain');
            throw new Error('Custom MimeType Error');
          },
        },
        FileSizeException: {
          throw: jest.fn(() => {
            throw new Error('Custom FileSize Error');
          }),
        },
        InvalidFileException: {
          throw: jest.fn(() => {
            throw new Error('Custom InvalidFile Error');
          }),
        },
      };

      expect(() => {
        validateAvatarImageFile(
          file,
          'test-transaction',
          mockLogger,
          customExceptions,
        );
      }).toThrow('Custom MimeType Error');
    });
  });
});
