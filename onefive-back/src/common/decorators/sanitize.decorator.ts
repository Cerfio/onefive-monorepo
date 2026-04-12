/**
 * Sanitization decorators for DTO fields - XSS prevention
 *
 * Usage:
 *   @SanitizeText()   → on plain text fields (names, titles, etc.)
 *   @SanitizeHtml()   → on rich text fields (content, bio, description)
 *   @SanitizeArray()  → on string arrays (tags, skills, categories)
 *
 * These decorators work via class-transformer's @Transform,
 * which is executed by NestJS's global ValidationPipe (transform: true).
 */

import { Transform } from 'class-transformer';
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeTextArray,
} from '../utils/sanitize.utils';

/**
 * Strips ALL HTML from a string field.
 * Use on: names, titles, cities, positions, short text, search queries.
 */
export function SanitizeText(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') return sanitizeText(value);
    return value;
  });
}

/**
 * Allows only safe formatting HTML tags on a string field.
 * Use on: content, bio, description, notes, messages.
 * Allowed: b, i, em, strong, a, p, br, ul, ol, li
 */
export function SanitizeHtml(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') return sanitizeRichText(value);
    return value;
  });
}

/**
 * Strips ALL HTML from each string in an array.
 * Use on: tags, skills, interests, categories, options.
 */
export function SanitizeArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return sanitizeTextArray(value);
    return value;
  });
}
