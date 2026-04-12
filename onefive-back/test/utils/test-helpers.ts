import { LogService } from 'logstash-winston-3';

/**
 * Creates a mock logger for testing
 */
export function createMockLogger(): jest.Mocked<LogService> {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

/**
 * Creates a mock user object for testing
 */
export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    authType: 'EMAIL',
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock session object for testing
 */
export function createMockSession(overrides: Partial<any> = {}) {
  return {
    sessionId: 'session-id',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock profile object for testing
 */
export function createMockProfile(overrides: Partial<any> = {}) {
  return {
    id: 'profile-id',
    userId: 'user-id',
    firstName: 'John',
    lastName: 'Doe',
    city: 'Paris',
    country: 'France',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    genderSalutationPreferenceType: 'MALE',
    urlAvatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates mock request object with transaction ID
 */
export function createMockRequest(overrides: Partial<any> = {}) {
  return {
    id: 'transaction-id',
    userId: 'user-id',
    headers: {
      cookie: 'token=session-token',
    },
    ...overrides,
  };
}

/**
 * Creates mock Prisma error with specific code
 */
export function createMockPrismaError(
  code: string,
  message: string = 'Prisma error',
) {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

/**
 * Common Prisma error codes
 */
export const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  CONNECTION_ERROR: 'P1001',
} as const;

/**
 * Waits for a specified amount of time (useful for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock bcrypt module for testing
 */
export function createMockBcrypt() {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}

/**
 * Sets up environment variables for testing
 */
export function setupTestEnv() {
  process.env.KEY_AUTHENTICATION = 'test-key';
  process.env.SESSION_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
}

/**
 * Cleans up environment variables after testing
 */
export function cleanupTestEnv() {
  delete process.env.KEY_AUTHENTICATION;
  delete process.env.SESSION_SECRET;
  delete process.env.NODE_ENV;
}

/**
 * Creates a mock service with common methods
 */
export function createMockService(
  methods: string[] = ['create', 'get', 'update', 'delete'],
) {
  const mockService: any = {};

  methods.forEach((method) => {
    mockService[method] = jest.fn();
  });

  return mockService;
}

/**
 * Asserts that a function throws a specific exception
 */
export async function expectToThrow(
  fn: () => Promise<any>,
  expectedError: new (...args: any[]) => Error,
  expectedMessage?: string,
) {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    expect(error).toBeInstanceOf(expectedError);
    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }
  }
}

/**
 * Creates mock validation error for DTOs
 */
export function createMockValidationError(field: string, message: string) {
  return {
    field,
    message,
    constraints: {
      [field]: message,
    },
  };
}

/**
 * Common test data generators
 */
export const TestData = {
  validEmail: () => 'test@example.com',
  invalidEmail: () => 'invalid-email',
  validPassword: () => 'password123',
  shortPassword: () => '123',
  validUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  invalidUUID: () => 'not-a-uuid',
  validDate: () => '1990-01-01T00:00:00.000Z',
  invalidDate: () => 'invalid-date',
  validPhoneNumber: () => '+1234567890',
  invalidPhoneNumber: () => '123',
};
