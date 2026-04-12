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

describe('ReferralController (e2e)', () => {
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
      .send({ email: createUniqueEmail('ref'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  // ── GET /referral/stats ───────────────────────────────
  describe('GET /referral/stats', () => {
    it('should get referral stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/referral/stats')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/referral/stats').expect(401);
    });
  });

  // ── GET /referral/leaderboard ─────────────────────────
  describe('GET /referral/leaderboard', () => {
    it('should get referral leaderboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/referral/leaderboard')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should accept limit param', async () => {
      const res = await request(app.getHttpServer())
        .get('/referral/leaderboard?limit=5')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── GET /referral/my-referrals ────────────────────────
  describe('GET /referral/my-referrals', () => {
    it('should get my referrals', async () => {
      const res = await request(app.getHttpServer())
        .get('/referral/my-referrals')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/referral/my-referrals')
        .expect(401);
    });
  });
});
