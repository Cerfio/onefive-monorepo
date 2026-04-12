import { SecurityService } from './security.service';

describe('SecurityService', () => {
  const createLoggerMock = () => ({
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  });

  it('should be defined', () => {
    const logger = createLoggerMock();
    const service = new SecurityService(logger as any);
    expect(service).toBeDefined();
  });

  it('should block IP after too many failed login attempts', async () => {
    const logger = createLoggerMock();
    const service = new SecurityService(logger as any);
    const ip = '127.0.0.1';

    for (let index = 0; index < 5; index += 1) {
      await service.logSecurityEvent({
        type: 'LOGIN_FAILED',
        ip,
        userAgent: 'jest',
        details: { attempt: index + 1 },
      });
    }

    await expect(service.isBlockedIP(ip)).resolves.toBe(true);
    await expect(service.checkSuspiciousActivity(ip)).resolves.toBe(false);
  });

  it('should clear failed attempts on successful login', async () => {
    const logger = createLoggerMock();
    const service = new SecurityService(logger as any);
    const ip = '10.0.0.1';

    await service.logSecurityEvent({
      type: 'LOGIN_FAILED',
      ip,
      userAgent: 'jest',
      details: {},
    });

    await service.logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      ip,
      userAgent: 'jest',
      details: {},
    });

    await expect(service.isBlockedIP(ip)).resolves.toBe(false);
    await expect(service.checkSuspiciousActivity(ip)).resolves.toBe(true);
  });

  it('should support manual temporary IP block', async () => {
    const logger = createLoggerMock();
    const service = new SecurityService(logger as any);
    const ip = '192.168.1.10';

    await service.blockIP(ip, 'manual test', 200);
    await expect(service.isBlockedIP(ip)).resolves.toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 220));
    await expect(service.isBlockedIP(ip)).resolves.toBe(false);
  });
});
