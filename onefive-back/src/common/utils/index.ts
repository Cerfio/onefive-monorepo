/**
 * Common utilities for the OneFive application
 *
 * This module exports reusable utility functions that can be used across
 * different modules to avoid code duplication and ensure consistency.
 */

// Existing utility functions
export {
  maskSensitiveData,
  maskSensitiveDataArray,
  maskSensitiveDataSafe,
  FIELD_TO_MASK,
  FORCE_MASK_NAME,
} from './security.utils';

export {
  formatUserName,
  formatFileSize,
  formatDate,
  formatDateTime,
  truncateText,
  formatPercentage,
} from './format.utils';

export { processSearchQuery } from './search.utils';

export {
  isValidUUID,
  isValidEmail,
  sanitizeInput,
  isValidLength,
  validateTags,
} from './validation.utils';

export { normalizeString } from './string.utils';

export {
  validateImageFile,
  validateImageFileOrThrow,
  DEFAULT_IMAGE_CONFIG,
  IMAGE_VALIDATION_PRESETS,
  type ImageValidationConfig,
  type ImageValidationResult,
} from './image-validation.utils';

export {
  validateProfileImageFile,
  validateAvatarImageFile,
  validateCoverImageFile,
  type ProfileImageExceptions,
} from './profile-image-validation.utils';

export { FileUrlUtils } from './file-url.utils';
