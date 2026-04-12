/**
 * Image file validation utilities
 */

export interface ImageValidationConfig {
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
  maxFilenameLength?: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Default configuration for image validation
 */
export const DEFAULT_IMAGE_CONFIG: Required<ImageValidationConfig> = {
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFilenameLength: 255,
};

/**
 * Validates an image file against the provided configuration
 * @param file - The multer file to validate
 * @param config - Optional configuration, uses defaults if not provided
 * @returns ImageValidationResult with validation status and errors
 */
export const validateImageFile = (
  file: Express.Multer.File,
  config: ImageValidationConfig = {},
): ImageValidationResult => {
  const finalConfig = { ...DEFAULT_IMAGE_CONFIG, ...config };
  const errors: string[] = [];

  // Validate MIME type
  if (!finalConfig.allowedMimeTypes.includes(file.mimetype)) {
    errors.push(
      `Invalid MIME type: ${file.mimetype}. Allowed types: ${finalConfig.allowedMimeTypes.join(', ')}`,
    );
  }

  // Validate file size
  if (file.size > finalConfig.maxSize) {
    errors.push(
      `File size too large: ${file.size} bytes. Maximum allowed: ${finalConfig.maxSize} bytes`,
    );
  }

  // Validate filename
  if (
    !file.originalname ||
    file.originalname.length > finalConfig.maxFilenameLength
  ) {
    errors.push(
      `Invalid filename: ${file.originalname}. Maximum length: ${finalConfig.maxFilenameLength} characters`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates an image file and throws an exception if invalid
 * @param file - The multer file to validate
 * @param config - Optional configuration
 * @param throwException - Function to throw the appropriate exception
 */
export const validateImageFileOrThrow = (
  file: Express.Multer.File,
  config: ImageValidationConfig = {},
  throwException: (errors: string[]) => never,
): void => {
  const result = validateImageFile(file, config);

  if (!result.isValid) {
    throwException(result.errors);
  }
};

/**
 * Predefined configurations for common use cases
 */
export const IMAGE_VALIDATION_PRESETS = {
  AVATAR: {
    allowedMimeTypes: DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFilenameLength: 255,
  },
  COVER: {
    allowedMimeTypes: DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFilenameLength: 255,
  },
  POST_MEDIA: {
    allowedMimeTypes: DEFAULT_IMAGE_CONFIG.allowedMimeTypes,
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFilenameLength: 255,
  },
} as const;
