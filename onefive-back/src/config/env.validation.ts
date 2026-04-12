/**
 * Environment variables validation at boot.
 * Fails fast if required vars are missing or invalid.
 * Skips validation when NODE_ENV=test (tests use .env.test or mocks).
 */
export function validateEnv(): Record<string, string> {
  if (process.env.NODE_ENV === 'test') {
    return process.env as Record<string, string>;
  }

  const errors: string[] = [];

  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'PORT',
    'FRONTEND_URL',
    'KEY_AUTHENTICATION',
  ] as const;

  for (const key of required) {
    const value = process.env[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Missing or empty: ${key}`);
    }
  }

  // FRONTEND_URL format validation (valid URL)
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    try {
      const urls = frontendUrl.split(',').map((u) => u.trim());
      for (const url of urls) {
        if (!url) continue;
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.push(`FRONTEND_URL must use http or https: ${url}`);
        }
      }
    } catch {
      errors.push(
        `FRONTEND_URL must be a valid URL (comma-separated for multiple): ${frontendUrl}`,
      );
    }
  }

  // SESSION_SECRET minimum length
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    errors.push('SESSION_SECRET must be at least 32 characters');
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  return process.env as Record<string, string>;
}
