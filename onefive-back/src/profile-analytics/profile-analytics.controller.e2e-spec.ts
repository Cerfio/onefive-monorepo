import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('ProfileAnalyticsController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('analytics'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  // ── GET /profile-analytics/overview ───────────────────
  describe('GET /profile-analytics/overview', () => {
    it('should get analytics overview', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile-analytics/overview')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should accept timeRange query param', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile-analytics/overview')
        .query({ timeRange: '7d' })
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/profile-analytics/overview')
        .expect(401);
    });
  });

  // ── GET /profile-analytics/visitors ───────────────────
  describe('GET /profile-analytics/visitors', () => {
    it('should get visitors analytics', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile-analytics/visitors')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // ── GET /profile-analytics/engagement ─────────────────
  describe('GET /profile-analytics/engagement', () => {
    it('should get engagement analytics', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile-analytics/engagement')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
