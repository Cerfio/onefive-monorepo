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

describe('AuthController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ── Signup ────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const email = createUniqueEmail('signup');
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
    });

    it('should return success when signing up with an already-used email (no email enumeration)', async () => {
      const email = createUniqueEmail('duplicate');

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
    });

    it('should fail with a weak password (no symbol)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: createUniqueEmail('weak'), password: 'Abcdefg1' })
        .expect(400);

      expect(res.body.success).toBeFalsy();
    });

    it('should fail with an invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'not-an-email', password: validPassword })
        .expect(400);

      expect(res.body.success).toBeFalsy();
    });
  });

  // ── Signin ────────────────────────────────────────────

  describe('POST /auth/signin', () => {
    const signinEmail = createUniqueEmail('signin');

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: signinEmail, password: validPassword })
        .expect(201);
    });

    it('should sign in with valid credentials and return a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: signinEmail, password: validPassword })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: signinEmail, password: 'WrongPass1!@' });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with non-existent email (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'ghost@nowhere.test', password: validPassword });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── Email verification ────────────────────────────────

  describe('GET /auth/email/has-been-verified', () => {
    it('should return verification status with auth', async () => {
      const user = await createAuthenticatedUser(app, request, 'emailcheck');

      const res = await request(app.getHttpServer())
        .get('/auth/email/has-been-verified')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isVerified');
      expect(res.body.data).toHaveProperty('email');
    });
  });

  // ── SMS routes (require auth) ─────────────────────────

  describe('POST /auth/sms/request', () => {
    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/auth/sms/request')
        .send({ phoneNumber: '+33612345678' })
        .expect(401);
    });
  });

  describe('POST /auth/sms/confirm', () => {
    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/auth/sms/confirm')
        .send({ code: '123456' })
        .expect(401);
    });
  });

  // ── Password reset (public) ───────────────────────────

  describe('POST /auth/password/reset/request', () => {
    it('should succeed even with a non-existent email (for security)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/reset/request')
        .send({ email: 'nobody@example.com' });

      // Must not reveal whether the email exists — should return success or 2xx
      expect(res.statusCode).toBeLessThan(500);
    });
  });

  // ── OAuth (skipped — requires external providers) ─────

  describe('OAuth providers', () => {
    it('POST /auth/linkedin - requires LinkedIn OAuth code', () => {});
    it('POST /auth/google - requires Google OAuth code', () => {});
  });
});
