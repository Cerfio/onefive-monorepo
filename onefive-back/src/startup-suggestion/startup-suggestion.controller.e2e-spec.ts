import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
  createStartupData,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('StartupSuggestionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let startupId: string;

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
      .send({ email: createUniqueEmail('ssug'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a startup for follow test
    const startupRes = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${authToken}`)
      .send(createStartupData());

    if (startupRes.body.success && startupRes.body.data) {
      startupId = startupRes.body.data.id;
    }
  });

  // ── GET /startup-suggestion ───────────────────────────
  describe('GET /startup-suggestion', () => {
    it('should get startup suggestions', async () => {
      const res = await request(app.getHttpServer())
        .get('/startup-suggestion')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should accept limit and skip query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/startup-suggestion?limit=5&skip=0')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── POST /startup-suggestion/follow/:startupId ───────
  describe('POST /startup-suggestion/follow/:startupId', () => {
    it('should toggle follow on a suggested startup', async () => {
      if (!startupId) return;

      const res = await request(app.getHttpServer())
        .post(`/startup-suggestion/follow/${startupId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('following');
    });
  });
});
