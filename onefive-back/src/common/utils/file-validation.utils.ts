import { BadRequestException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

/**
 * Dataroom file upload validation & sanitization utilities
 */

// ── MIME type whitelist ──────────────────────────────────────────────────────
export const ALLOWED_DATAROOM_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  // Archives (optional, for bulk docs)
  'application/zip',
] as const;

// ── Dangerous extensions blacklist (defense-in-depth) ────────────────────────
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.scr',
  '.pif',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.vbs',
  '.vbe',
  '.wsf',
  '.wsh',
  '.ps1',
  '.sh',
  '.bash',
  '.html',
  '.htm',
  '.xhtml',
  '.svg',
  '.xml',
  '.swf',
  '.jar',
  '.class',
  '.dll',
  '.so',
  '.dylib',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.cgi',
  '.py',
  '.rb',
  '.pl',
]);

// ── Limits ───────────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
export const MAX_FILES_PER_UPLOAD = 20;
export const MAX_FILENAME_LENGTH = 255;

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates MIME type against the whitelist.
 * Throws BadRequestException if the type is not allowed.
 */
export function validateMimeType(mimetype: string, filename: string): void {
  if (
    !ALLOWED_DATAROOM_MIME_TYPES.includes(
      mimetype as (typeof ALLOWED_DATAROOM_MIME_TYPES)[number],
    )
  ) {
    throw new BadRequestException(
      `File type not allowed: "${mimetype}" for file "${filename}". Allowed types: PDF, Word, Excel, PowerPoint, CSV, TXT, JPEG, PNG, WebP, ZIP.`,
    );
  }
}

/**
 * Validates that the file extension is not in the blocked list.
 * Defense-in-depth: even if MIME type is spoofed, block dangerous extensions.
 */
export function validateExtension(filename: string): void {
  const ext = getExtension(filename);
  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new BadRequestException(
      `File extension not allowed: "${ext}" for file "${filename}".`,
    );
  }
}

/**
 * Validates file buffer size.
 */
export function validateFileSize(
  size: number,
  filename: string,
  maxSize: number = MAX_FILE_SIZE,
): void {
  if (size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    const fileMB = (size / (1024 * 1024)).toFixed(2);
    throw new BadRequestException(
      `File "${filename}" is too large (${fileMB} MB). Maximum allowed: ${maxMB} MB.`,
    );
  }
}

/**
 * Validates that the number of files in a batch does not exceed the limit.
 */
export function validateFileCount(count: number): void {
  if (count > MAX_FILES_PER_UPLOAD) {
    throw new BadRequestException(
      `Too many files: ${count}. Maximum allowed per upload: ${MAX_FILES_PER_UPLOAD}.`,
    );
  }
  if (count === 0) {
    throw new BadRequestException('No files provided in the upload.');
  }
}

// ── Sanitization ─────────────────────────────────────────────────────────────

/**
 * Sanitizes a filename:
 * - Strips directory traversal sequences (../, ..\, /, \)
 * - Removes non-safe characters (keeps alphanumeric, dots, hyphens, underscores)
 * - Collapses consecutive dots
 * - Trims to MAX_FILENAME_LENGTH
 * - Falls back to 'unnamed' if the result is empty
 */
export function sanitizeFilename(rawFilename: string): string {
  let safe = rawFilename
    // Remove directory components
    .replace(/^.*[/\\]/, '')
    // Remove path traversal
    .replace(/\.\./g, '')
    // Keep only safe characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Collapse consecutive dots
    .replace(/\.{2,}/g, '.')
    // Collapse consecutive underscores
    .replace(/_{2,}/g, '_')
    // Remove leading/trailing dots and underscores
    .replace(/^[._]+|[._]+$/g, '');

  if (!safe) {
    safe = 'unnamed';
  }

  if (safe.length > MAX_FILENAME_LENGTH) {
    // Keep extension intact if possible
    const ext = getExtension(safe);
    const base = safe.slice(0, MAX_FILENAME_LENGTH - ext.length);
    safe = base + ext;
  }

  return safe;
}

/**
 * Generates a safe, unique S3 key for a dataroom file.
 * Format: dataroom/<dataroomId>/<cuid2>-<sanitized_filename>
 */
export function generateSafeStorageKey(
  dataroomId: string,
  rawFilename: string,
): string {
  const safeName = sanitizeFilename(rawFilename);
  const uniqueId = createId();
  return `dataroom/${dataroomId}/${uniqueId}-${safeName}`;
}

// ── Orchestration ────────────────────────────────────────────────────────────

/**
 * Runs all validations on a single file.
 * Call this before uploading to storage.
 */
export function validateUploadedFile(
  file: { filename: string; mimetype: string; size: number },
  maxSize?: number,
): void {
  validateMimeType(file.mimetype, file.filename);
  validateExtension(file.filename);
  validateFileSize(file.size, file.filename, maxSize);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex > 0 ? filename.slice(dotIndex).toLowerCase() : '';
}
