import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUniqueEmail,
  validPassword,
  createEducationData,
} from '../../test/helpers/fixtures';

describe('AuthController – Security (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ── Session / Cookie security ─────────────────────────

  describe('Session token validation', () => {
    it('should reject an invalid session token with 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .set('Cookie', 'token=this-is-a-totally-invalid-token')
        .expect(401);
    });

    it('should reject an empty cookie value with 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .set('Cookie', 'token=')
        .expect(401);
    });

    it('should reject a request with no cookie at all with 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .expect(401);
    });
  });

  // ── Input validation / injection ──────────────────────

  describe('Input validation and injection prevention', () => {
    it('should reject SQL injection attempt in email field with 400', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        email: '\' OR 1=1; DROP TABLE "User"; --',
        password: validPassword,
      });

      expect([400, 422]).toContain(res.statusCode);
    });

    it('should reject a very long email with 400', async () => {
      const longEmail = 'a'.repeat(500) + '@example.com';
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: longEmail, password: validPassword });

      expect([400, 422]).toContain(res.statusCode);
    });

    it('should handle XSS payloads without executing them', async () => {
      const xssEmail = '<script>alert("xss")</script>@example.com';
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: xssEmail, password: validPassword });

      // Should be rejected by validation or at minimum not reflect raw script
      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ── Response safety ───────────────────────────────────

  describe('Response safety', () => {
    it('should not include the password in the signup response', async () => {
      const email = createUniqueEmail('safe');
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain(validPassword);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should not leak stack traces in error responses', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'bad', password: 'x' });

      expect(res.body.stack).toBeUndefined();
      // Also check nested fields
      if (res.body.error) {
        expect(res.body.error.stack).toBeUndefined();
      }
    });
  });

  // ── Security headers ──────────────────────────────────

  describe('Security headers', () => {
    it('should include Helmet security headers', async () => {
      const res = await request(app.getHttpServer()).get(
        '/auth/email/has-been-verified',
      );

      // Helmet sets these headers regardless of auth status
      const headers = res.headers;
      // x-frame-options or content-security-policy should be present
      const hasFrameProtection =
        headers['x-frame-options'] !== undefined ||
        headers['content-security-policy'] !== undefined;
      expect(hasFrameProtection).toBe(true);

      // x-content-type-options: nosniff
      expect(headers['x-content-type-options']).toBe('nosniff');
    });
  });

  // ── End-to-end auth flow ──────────────────────────────

  describe('Full signup → signin → authenticated request flow', () => {
    it('should signup, signin and use the token for protected routes', async () => {
      const email = createUniqueEmail('flow');

      // 1. Signup
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      const signupToken = signupRes.body.data.token;
      expect(signupToken).toBeDefined();

      // 2. Signin with same credentials
      const signinRes = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email, password: validPassword })
        .expect(201);

      const signinToken = signinRes.body.data.token;
      expect(signinToken).toBeDefined();

      // 3. Use signin token to access a protected route
      const protectedRes = await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .set('Cookie', `token=${signinToken}`)
        .expect(200);

      expect(protectedRes.body.success).toBe(true);
    });
  });
});
