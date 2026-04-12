/**
 * HTML Sanitization utilities - Protection against Stored XSS
 *
 * Uses sanitize-html library for robust HTML sanitization.
 * Replaces the naive regex-based sanitizeInput() in validation.utils.ts.
 *
 * Three levels of sanitization:
 * 1. sanitizeText()      → Strips ALL HTML (names, titles, tags, short text)
 * 2. sanitizeRichText()  → Allows basic safe formatting tags (content, bio, description)
 * 3. sanitizeTextArray() → Sanitizes each string in an array (tags, skills, etc.)
 */

import * as sanitizeHtml from 'sanitize-html';

/**
 * Strips ALL HTML tags. Use for:
 * - Names (firstName, lastName, company, school, etc.)
 * - Titles (position, degree, tagline, etc.)
 * - Short text (city, domain, instrument, etc.)
 * - Search queries
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Allows basic safe HTML formatting tags. Use for:
 * - Post/discussion content
 * - Comments and replies
 * - Messages
 * - Bio, description, notes
 *
 * Allowed tags: b, i, em, strong, a, p, br, ul, ol, li
 * Allowed attributes: a[href] (http/https/mailto only)
 * Blocks: script, style, img, iframe, form, input, svg, object, embed
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Block javascript: URIs in href
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto'],
    },
  }).trim();
}

/**
 * Sanitizes each string in an array (strips ALL HTML).
 * Use for: tags, skills, interests, categories, options, etc.
 */
export function sanitizeTextArray(input: string[]): string[] {
  if (!Array.isArray(input)) return input;
  return input.map((item) =>
    typeof item === 'string' ? sanitizeText(item) : item,
  );
}
