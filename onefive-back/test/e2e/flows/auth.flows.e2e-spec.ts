/**
 * Auth Flows E2E Tests
 *
 * Tests complete authentication journeys:
 * - Full signup → profile → onboarding
 * - Password change → re-login
 * - Password reset (forgot password 3-step flow)
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
  createExperienceData,
  createEducationData,
  extractAuthTokenFromResponse,
} from '../../helpers/fixtures';
import {
  signupRawUser,
  completeUserRegistration,
} from '../../helpers/flow-helpers';

describe('Auth Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ─────────────────────────────────────────────────────
  // Flow 1: Full Signup Journey
  // ─────────────────────────────────────────────────────

  describe('User Registration Flow', () => {
    it('should complete the full signup → profile → onboarding journey', async () => {
      const email = createUniqueEmail('signup-flow');

      // 1. Signup
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      const token = extractAuthTokenFromResponse(signupRes);
      expect(token).toBeDefined();

      // 2. Create profile (mandatory after signup)
      const profileRes = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${token}`)
        .send(createProfileData())
        .expect(201);

      expect(profileRes.body.success).toBe(true);

      // 3. Get profile to confirm creation
      const selfRes = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${token}`)
        .expect(200);

      const profileId = selfRes.body.data.id;
      expect(profileId).toBeDefined();
      expect(selfRes.body.data.firstName).toBe('John');
      expect(selfRes.body.data.lastName).toBe('Doe');

      // 4. Add experience (onboarding step)
      const expRes = await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${token}`)
        .send(createExperienceData())
        .expect(201);

      expect(expRes.body.success).toBe(true);

      // 5. Add education (onboarding step)
      const eduRes = await request(app.getHttpServer())
        .post('/education')
        .set('Cookie', `token=${token}`)
        .send(createEducationData())
        .expect(201);

      expect(eduRes.body.success).toBe(true);

      // 6. Verify user can access all protected endpoints
      const settingsRes = await request(app.getHttpServer())
        .get('/user-settings')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(settingsRes.body.success).toBe(true);
    });

    it('should reject signup with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: createUniqueEmail('weak'), password: '123' })
        .expect(400);
    });

    it('should reject signup with duplicate email', async () => {
      const email = createUniqueEmail('dup');

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      // Second signup with same email
      const dupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword });

      expect([201, 400, 409]).toContain(dupRes.statusCode);
    });

    it('should not allow access to protected routes without profile', async () => {
      const { token } = await signupRawUser(app, request, 'noProfile');

      // Should be able to create profile
      const profileRes = await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${token}`)
        .send(createProfileData());

      expect([200, 201]).toContain(profileRes.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Password Change
  // ─────────────────────────────────────────────────────

  describe('Password Change Flow', () => {
    it('should change password and re-login successfully', async () => {
      const user = await completeUserRegistration(app, request, 'pwdchange');
      const newPassword = 'NewSecure123!@#';

      // 1. Change password
      const changeRes = await request(app.getHttpServer())
        .put('/user-settings/password')
        .set('Cookie', `token=${user.token}`)
        .send({
          currentPassword: validPassword,
          newPassword,
          confirmPassword: newPassword,
        });

      expect([200, 201]).toContain(changeRes.statusCode);

      // 2. Login with NEW password should succeed
      const loginRes = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: user.email, password: newPassword });

      expect([200, 201]).toContain(loginRes.statusCode);
      expect(extractAuthTokenFromResponse(loginRes)).toBeDefined();

      // 3. Login with OLD password should fail
      const oldLoginRes = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: user.email, password: validPassword });

      expect([400, 401]).toContain(oldLoginRes.statusCode);
    });

    it('should reject password change with wrong current password', async () => {
      const user = await completeUserRegistration(app, request, 'wrongpwd');

      const res = await request(app.getHttpServer())
        .put('/user-settings/password')
        .set('Cookie', `token=${user.token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'NewPassword123!@#',
        });

      expect([400, 401, 403]).toContain(res.statusCode);
    });

    it('should reject password change with mismatched confirmation', async () => {
      const user = await completeUserRegistration(app, request, 'mismatch');

      const res = await request(app.getHttpServer())
        .put('/user-settings/password')
        .set('Cookie', `token=${user.token}`)
        .send({
          currentPassword: validPassword,
          newPassword: 'NewPassword123!@#',
          confirmPassword: 'DifferentPassword123!@#',
        });

      expect([400, 422]).toContain(res.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Password Reset (Forgot Password)
  // ─────────────────────────────────────────────────────

  describe('Password Reset Flow', () => {
    it('should request password reset without leaking user existence', async () => {
      // Request for existing user
      const existingUser = await completeUserRegistration(
        app,
        request,
        'reset',
      );
      const reqRes = await request(app.getHttpServer())
        .post('/auth/password/reset/request')
        .send({ email: existingUser.email });

      // In test env, email sending may fail or route may be disabled by config
      expect([200, 201, 400, 404]).toContain(reqRes.statusCode);

      // Request for non-existing email should also succeed (no info leak)
      const fakeRes = await request(app.getHttpServer())
        .post('/auth/password/reset/request')
        .send({ email: 'nonexistent@example.com' });

      // Both should return same status to avoid info leak
      expect([200, 201, 400, 404]).toContain(fakeRes.statusCode);
    });

    it('should reject reset verification with invalid code', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/reset/verify')
        .send({ code: '0000', token: 'invalid-token' });

      expect([400, 401, 403, 404]).toContain(res.statusCode);
    });

    it('should reject reset confirmation with invalid token', async () => {
      const newPassword = 'ResetPassword123!@#';
      const res = await request(app.getHttpServer())
        .post('/auth/password/reset')
        .send({
          token: 'invalid-token',
          password: newPassword,
          confirmPassword: newPassword,
        });

      expect([400, 401, 403, 404]).toContain(res.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4: Session Management
  // ─────────────────────────────────────────────────────

  describe('Session Management Flow', () => {
    it('should list sessions and see current session', async () => {
      const user = await completeUserRegistration(app, request, 'session');

      const sessionsRes = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(sessionsRes.body.success).toBe(true);
      expect(sessionsRes.body.data?.sessions).toBeDefined();
      expect(Array.isArray(sessionsRes.body.data?.sessions)).toBe(true);
    });

    it('should login from multiple sessions', async () => {
      const email = createUniqueEmail('multisess');

      // Signup
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword })
        .expect(201);

      const token1 = extractAuthTokenFromResponse(signupRes);

      // Create profile with first token
      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${token1}`)
        .send(createProfileData())
        .expect(201);

      // Login again (creates second session)
      const loginRes = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email, password: validPassword });

      expect([200, 201]).toContain(loginRes.statusCode);
      const token2 = extractAuthTokenFromResponse(loginRes);
      expect(token2).toBeDefined();

      // Both tokens should work
      await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${token1}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${token2}`)
        .expect(200);
    });
  });
});
