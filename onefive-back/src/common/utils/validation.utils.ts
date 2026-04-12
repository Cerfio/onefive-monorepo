/**
 * General validation utilities
 */

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @deprecated Use sanitizeText() or sanitizeRichText() from sanitize.utils.ts instead.
 * This naive regex is NOT safe against XSS (entity encoding, event handlers, etc.)
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidLength = (
  text: string,
  min: number,
  max: number,
): boolean => {
  const length = text.trim().length;
  return length >= min && length <= max;
};

export const validateTags = (tags: string[], maxTags: number = 5): boolean => {
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > maxTags) {
    return false;
  }

  return tags.every(
    (tag) =>
      typeof tag === 'string' &&
      tag.trim().length > 0 &&
      tag.trim().length <= 50,
  );
};
