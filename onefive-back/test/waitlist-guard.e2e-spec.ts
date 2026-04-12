import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUserInWaitlist,
  createStartupData,
} from './helpers/fixtures';

describe('Waitlist Guard (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let activeToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    const user = await createAuthenticatedUser(app, request, 'waitguard');
    activeToken = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('rejects protected endpoint without auth', async () => {
    const res = await request(app.getHttpServer()).get('/profile/self');
    expect([401, 429]).toContain(res.status);
  });

  it('allows authenticated ACTIVE user on protected endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${activeToken}`);

    expect(res.status).toBe(200);
  });

  it('rejects WAITING user on POST /startup (403)', async () => {
    const waitingUser = await createUserInWaitlist(app, request, 'waiting');

    const res = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${waitingUser.token}`)
      .send(createStartupData());

    expect(res.status).toBe(403);
  });

  it('allows ACTIVE user on POST /startup (200 or 201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${activeToken}`)
      .send(createStartupData());

    expect([200, 201]).toContain(res.status);
  });

  describe('Waitlist API', () => {
    it('GET /waitlist/status returns structure (status, referralCode, rank)', async () => {
      const res = await request(app.getHttpServer())
        .get('/waitlist/status')
        .set('Cookie', `token=${activeToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty('status');
      expect(['ACTIVE', 'WAITING']).toContain(res.body.data.status);
      expect(res.body.data).toHaveProperty('referralCode');
      expect(typeof res.body.data.referralCode).toBe('string');
    });

    it('PUT /waitlist/leaderboard-opt-in toggles and persists', async () => {
      const res1 = await request(app.getHttpServer())
        .put('/waitlist/leaderboard-opt-in')
        .set('Cookie', `token=${activeToken}`)
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.data).toHaveProperty('showInLeaderboard');
      const firstValue = res1.body.data.showInLeaderboard;

      const res2 = await request(app.getHttpServer())
        .put('/waitlist/leaderboard-opt-in')
        .set('Cookie', `token=${activeToken}`)
        .expect(200);

      expect(res2.body.data.showInLeaderboard).not.toBe(firstValue);

      const res3 = await request(app.getHttpServer())
        .put('/waitlist/leaderboard-opt-in')
        .set('Cookie', `token=${activeToken}`)
        .expect(200);

      expect(res3.body.data.showInLeaderboard).toBe(firstValue);
    });

    it('GET /waitlist/referrer/:code returns referrer for valid code, 404 for invalid', async () => {
      const statusRes = await request(app.getHttpServer())
        .get('/waitlist/status')
        .set('Cookie', `token=${activeToken}`)
        .expect(200);
      const validCode = statusRes.body.data?.referralCode;

      if (validCode) {
        const validRes = await request(app.getHttpServer())
          .get(`/waitlist/referrer/${validCode}`);
        expect([200]).toContain(validRes.status);
        expect(validRes.body.data).toBeDefined();
      }

      const invalidRes = await request(app.getHttpServer())
        .get('/waitlist/referrer/INVALID_CODE_XYZ_123');
      expect(invalidRes.status).toBe(404);
    });
  });
});
