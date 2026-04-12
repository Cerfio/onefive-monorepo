import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should skip validation when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    expect(() => validateEnv()).not.toThrow();
  });

  it('should throw when required vars are missing', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = '';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.PORT = '50050';
    process.env.FRONTEND_URL = 'http://localhost:3002';
    process.env.KEY_AUTHENTICATION = 'key';

    process.env.DATABASE_URL = '';
    expect(() => validateEnv()).toThrow(/Missing or empty: DATABASE_URL/);
  });

  it('should throw when SESSION_SECRET is too short', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://localhost';
    process.env.SESSION_SECRET = 'short';
    process.env.PORT = '50050';
    process.env.FRONTEND_URL = 'http://localhost:3002';
    process.env.KEY_AUTHENTICATION = 'key';

    expect(() => validateEnv()).toThrow(/SESSION_SECRET must be at least 32/);
  });

  it('should throw when FRONTEND_URL is invalid', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://localhost';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.PORT = '50050';
    process.env.FRONTEND_URL = 'not-a-valid-url';
    process.env.KEY_AUTHENTICATION = 'key';

    expect(() => validateEnv()).toThrow(/FRONTEND_URL must be a valid URL/);
  });

  it('should pass with valid env', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://localhost';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.PORT = '50050';
    process.env.FRONTEND_URL = 'http://localhost:3002';
    process.env.KEY_AUTHENTICATION = 'key';

    expect(() => validateEnv()).not.toThrow();
  });

  it('should accept comma-separated FRONTEND_URL', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://localhost';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.PORT = '50050';
    process.env.FRONTEND_URL = 'https://app.onefive.com,https://staging.onefive.com';
    process.env.KEY_AUTHENTICATION = 'key';

    expect(() => validateEnv()).not.toThrow();
  });
});
