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

describe('StreakController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('streak'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /streak', () => {
    it('should create a streak entry', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/streak')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data).toBeDefined();
      expect(typeof res1.body.data.currentStreak).toBe('number');
    });

    it('should be idempotent and return 200 on duplicate call', async () => {
      // First call creates the streak
      await request(app.getHttpServer())
        .post('/streak')
        .set('Cookie', `token=${authToken}`);

      // Second call should also return 200 with currentStreak (idempotent)
      const res2 = await request(app.getHttpServer())
        .post('/streak')
        .set('Cookie', `token=${authToken}`);
      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(typeof res2.body.data.currentStreak).toBe('number');
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post('/streak');
      // ThrottlerGuard may return 429 before SessionGuard returns 401
      expect([401, 429]).toContain(res.statusCode);
    });
  });
});
