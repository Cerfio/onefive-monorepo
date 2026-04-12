/**
 * Profile image validation utilities
 */

import { LogService } from 'logstash-winston-3';
import {
  validateImageFileOrThrow,
  IMAGE_VALIDATION_PRESETS,
  type ImageValidationConfig,
} from './image-validation.utils';

export interface ProfileImageExceptions {
  MimeTypeException: {
    throw: (
      logger: LogService,
      args: {
        transactionId: string;
        mimetype: string;
        allowedMimeTypes: string[];
      },
    ) => never;
  };
  FileSizeException: {
    throw: (
      logger: LogService,
      args: {
        transactionId: string;
        fileSize: number;
        maxSize: number;
      },
    ) => never;
  };
  InvalidFileException: {
    throw: (
      logger: LogService,
      args: {
        transactionId: string;
        originalname?: string;
        maxLength?: number;
        errors?: string[];
      },
    ) => never;
  };
}

/**
 * Validates a profile image file and throws appropriate exceptions
 * @param file - The multer file to validate
 * @param transactionId - Transaction ID for logging
 * @param logger - Logger service
 * @param config - Image validation configuration
 * @param exceptions - Specific exceptions to throw for each error type
 */
export const validateProfileImageFile = (
  file: Express.Multer.File,
  transactionId: string,
  logger: LogService,
  config: ImageValidationConfig,
  exceptions: ProfileImageExceptions,
): void => {
  validateImageFileOrThrow(file, config, (errors: string[]) => {
    // Determine which type of error to throw based on the error message
    const firstError = errors[0];

    if (firstError.includes('Invalid MIME type')) {
      exceptions.MimeTypeException.throw(logger, {
        transactionId,
        mimetype: file.mimetype,
        allowedMimeTypes: config.allowedMimeTypes || [],
      });
    } else if (firstError.includes('File size too large')) {
      exceptions.FileSizeException.throw(logger, {
        transactionId,
        fileSize: file.size,
        maxSize: config.maxSize || 0,
      });
    } else if (firstError.includes('Invalid filename')) {
      exceptions.InvalidFileException.throw(logger, {
        transactionId,
        originalname: file.originalname,
        maxLength: config.maxFilenameLength || 255,
      });
    } else {
      // Fallback to generic invalid file exception
      exceptions.InvalidFileException.throw(logger, {
        transactionId,
        originalname: file.originalname,
        errors,
      });
    }
  });
};

/**
 * Validates an avatar image file
 * @param file - The multer file to validate
 * @param transactionId - Transaction ID for logging
 * @param logger - Logger service
 * @param exceptions - Avatar-specific exceptions
 */
export const validateAvatarImageFile = (
  file: Express.Multer.File,
  transactionId: string,
  logger: LogService,
  exceptions: ProfileImageExceptions,
): void => {
  validateProfileImageFile(
    file,
    transactionId,
    logger,
    IMAGE_VALIDATION_PRESETS.AVATAR,
    exceptions,
  );
};

/**
 * Validates a cover image file
 * @param file - The multer file to validate
 * @param transactionId - Transaction ID for logging
 * @param logger - Logger service
 * @param exceptions - Cover-specific exceptions
 */
export const validateCoverImageFile = (
  file: Express.Multer.File,
  transactionId: string,
  logger: LogService,
  exceptions: ProfileImageExceptions,
): void => {
  validateProfileImageFile(
    file,
    transactionId,
    logger,
    IMAGE_VALIDATION_PRESETS.COVER,
    exceptions,
  );
};
