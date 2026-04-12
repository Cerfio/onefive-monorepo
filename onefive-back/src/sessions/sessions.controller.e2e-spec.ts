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

describe('SessionsController (e2e)', () => {
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
      .send({ email: createUniqueEmail('sess'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  // ── GET /sessions ─────────────────────────────────────
  describe('GET /sessions', () => {
    it('should list sessions for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/sessions').expect(401);
    });
  });

  // ── DELETE /sessions/:sessionId ───────────────────────
  describe('DELETE /sessions/:sessionId', () => {
    it('should fail with a non-existent session id', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .delete(`/sessions/${fakeId}`)
        .set('Cookie', `token=${authToken}`);

      // 404 (not found), 400 (cannot revoke current), or 403 (guard/policy)
      expect([400, 403, 404]).toContain(res.status);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/sessions/some-id')
        .expect(401);
    });
  });
});
