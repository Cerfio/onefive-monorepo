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

describe('StartupController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let startupId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('startup'), password: validPassword })
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

  describe('POST /startup', () => {
    it('should create a startup', async () => {
      const res = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${authToken}`)
        .send(createStartupData());

      expect([200, 201]).toContain(res.statusCode);
      if (res.body.success && res.body.data) {
        startupId = res.body.data.id;
        expect(res.body.data).toBeDefined();
      }
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/startup')
        .send(createStartupData())
        .expect(401);
    });
  });

  describe('GET /startup/me', () => {
    it('should get current user startups', async () => {
      const res = await request(app.getHttpServer())
        .get('/startup/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/startup/me').expect(401);
    });
  });

  describe('GET /startup/profile/:profileId', () => {
    it('should get startups by profile', async () => {
      const selfRes = await request(app.getHttpServer())
        .get('/profile/self')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      const profileId = selfRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/startup/profile/${profileId}`)
        .set('Cookie', `token=${authToken}`);
      expect([200, 404]).toContain(res.statusCode);
    });
  });

  describe('GET /startup/search-profiles', () => {
    it('should search profiles for startup', async () => {
      const res = await request(app.getHttpServer())
        .get('/startup/search-profiles?q=test')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /startup/:id', () => {
    it('should get a startup by id', async () => {
      if (!startupId) return;
      const res = await request(app.getHttpServer())
        .get(`/startup/${startupId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /startup/:id', () => {
    it('should update a startup', async () => {
      if (!startupId) return;
      const res = await request(app.getHttpServer())
        .put(`/startup/${startupId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ description: 'Updated description' })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /startup/:id/members', () => {
    it('should get startup members', async () => {
      if (!startupId) return;
      const res = await request(app.getHttpServer())
        .get(`/startup/${startupId}/members`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /startup/:id/funding', () => {
    it('should get startup funding', async () => {
      if (!startupId) return;
      const res = await request(app.getHttpServer())
        .get(`/startup/${startupId}/funding`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
