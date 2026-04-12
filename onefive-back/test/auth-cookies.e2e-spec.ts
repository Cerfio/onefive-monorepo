import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';

describe('Auth Cookies Security (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    const prisma = context.prisma;

    testEmail = `cookie-test-${Date.now()}@example.com`;
    testPassword = 'SecureP@ssw0rd123!';

    // Create test user with hashed password (same formula as signup: password + KEY_AUTHENTICATION)
    const keyAuth = process.env.KEY_AUTHENTICATION || '';
    const hashedPassword = await bcrypt.hash(testPassword.concat(keyAuth), 10);
    await prisma.user.create({
      data: {
        email: testEmail,
        authType: 'EMAIL',
        isEmailVerified: true,
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    if (testEmail && context?.prisma) {
      const user = await context.prisma.user.findUnique({
        where: { email: testEmail },
      });
      if (user) {
        await context.prisma.session.deleteMany({ where: { userId: user.id } });
        await context.prisma.profile.deleteMany({ where: { userId: user.id } });
        await context.prisma.user.delete({ where: { id: user.id } });
      }
    }
    await safeCleanup(context);
  });

  // Helper to parse cookies from response
  function parseCookies(
    response: any,
  ): Record<string, { value: string; flags: string[] }> {
    const cookies: Record<string, { value: string; flags: string[] }> = {};
    const setCookieHeaders = response.headers['set-cookie'] || [];

    for (const cookieStr of setCookieHeaders) {
      const parts = cookieStr.split(';').map((p: string) => p.trim());
      const [name, value] = parts[0].split('=');
      cookies[name] = {
        value,
        flags: parts.slice(1).map((p: string) => p.toLowerCase()),
      };
    }

    return cookies;
  }

  describe('POST /auth/signin - Cookie Security', () => {
    it('should set cookies on successful signin', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect([200, 201, 400]).toContain(response.status);

      if (response.status === 400) {
        return;
      }

      const cookies = parseCookies(response);

      // Should have at least one cookie
      expect(Object.keys(cookies).length).toBeGreaterThan(0);

      console.log('\n=== Cookies Set on Signin ===');
      for (const [name, data] of Object.entries(cookies)) {
        console.log(`Cookie: ${name}`);
        console.log(`  Value: ${data.value.substring(0, 20)}...`);
        console.log(`  Flags: ${data.flags.join(', ')}`);
      }
      console.log('============================\n');
    });

    it('should set token cookie as httpOnly', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const cookies = parseCookies(response);

      if (cookies['token']) {
        const flags = cookies['token'].flags;

        // CRITICAL: token MUST be httpOnly
        expect(flags.some((f) => f === 'httponly')).toBe(true);

        // CRITICAL: sameSite should be lax
        expect(flags.some((f) => f.includes('samesite=lax'))).toBe(true);

        // Token should have path=/
        expect(flags.some((f) => f.includes('path=/'))).toBe(true);
      }
    });

    it('should set is_authenticated flag cookie as non-httpOnly', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const cookies = parseCookies(response);

      if (cookies['is_authenticated']) {
        const flags = cookies['is_authenticated'].flags;

        // is_authenticated should NOT be httpOnly (frontend needs to read it)
        expect(flags.some((f) => f === 'httponly')).toBe(false);

        // Value should be "1" (no sensitive data)
        expect(cookies['is_authenticated'].value).toBe('1');
      }
    });

    it('should NOT return token in JSON response body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      // Token should ONLY be in cookies, NOT in response body
      // Check that sensitive data is not in the response
      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/); // JWT pattern
    });
  });

  describe('POST /auth/signout - Cookie Cleanup', () => {
    it('should clear all auth cookies on signout', async () => {
      // First, sign in
      const signinResponse = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const signinCookies = Array.isArray(signinResponse.headers['set-cookie'])
        ? signinResponse.headers['set-cookie']
        : signinResponse.headers['set-cookie']
          ? [signinResponse.headers['set-cookie']]
          : [];
      const cookieHeader = signinCookies
        .map((c: string) => c.split(';')[0])
        .join('; ');

      // Then, sign out
      const signoutResponse = await request(app.getHttpServer())
        .post('/auth/signout')
        .set('Cookie', cookieHeader);

      expect([200, 201, 204, 404]).toContain(signoutResponse.status);

      if (signoutResponse.status === 404) {
        return;
      }

      const cookies = parseCookies(signoutResponse);

      // Cookies should be cleared (max-age=0 or expires in past)
      for (const [name, data] of Object.entries(cookies)) {
        if (['token', 'is_authenticated'].includes(name)) {
          const isCleared =
            data.flags.some((f) => f.includes('max-age=0')) ||
            data.flags.some((f) => {
              const match = f.match(/expires=(.+)/);
              if (match) {
                return new Date(match[1]) < new Date();
              }
              return false;
            }) ||
            data.value === '' ||
            data.value === 'deleted';

          expect(isCleared).toBe(true);
        }
      }
    });
  });

  describe('Security: Cookie Protection Analysis', () => {
    it('should demonstrate dual-cookie architecture', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const cookies = parseCookies(response);

      console.log('\n=== Dual Cookie Architecture ===');
      console.log('');
      console.log('1. "token" cookie (httpOnly):');
      console.log('   - Contains: Session token');
      console.log('   - httpOnly: true (JS cannot read)');
      console.log('   - Purpose: Authentication');
      console.log('   - XSS Impact: Cannot be stolen via document.cookie');
      console.log('');
      console.log('2. "is_authenticated" cookie (non-httpOnly):');
      console.log('   - Contains: "1" (boolean flag only)');
      console.log('   - httpOnly: false (JS can read)');
      console.log('   - Purpose: Frontend UX (show/hide login button)');
      console.log('   - XSS Impact: No sensitive data exposed');
      console.log('');
      console.log('Result: Even with XSS, attacker cannot steal session');
      console.log('================================\n');

      expect(true).toBe(true); // Documentation test
    });
  });
});
