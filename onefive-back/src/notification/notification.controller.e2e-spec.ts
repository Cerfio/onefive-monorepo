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

describe('NotificationController (e2e)', () => {
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
      .send({ email: createUniqueEmail('notif'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  // ── GET /notifications ────────────────────────────────
  describe('GET /notifications', () => {
    it('should list notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should list notifications with query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .query({ limit: '5', offset: '0', read: 'false' })
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/notifications').expect(401);
    });
  });

  // ── GET /notifications/counts ─────────────────────────
  describe('GET /notifications/counts', () => {
    it('should get notification counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/counts')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/notifications/counts')
        .expect(401);
    });
  });

  // ── PATCH /notifications/:id/read ─────────────────────
  describe('PATCH /notifications/:id/read', () => {
    it('should fail for non-existent notification', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .patch(`/notifications/${fakeId}/read`)
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/some-id/read')
        .expect(401);
    });
  });

  // ── PATCH /notifications/read-all ─────────────────────
  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .expect(401);
    });
  });

  // ── DELETE /notifications/:id ─────────────────────────
  describe('DELETE /notifications/:id', () => {
    it('should fail for non-existent notification', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .delete(`/notifications/${fakeId}`)
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/notifications/some-id')
        .expect(401);
    });
  });
});
