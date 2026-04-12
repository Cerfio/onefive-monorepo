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

describe('ProfilePostController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let profileId: string;

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
      .send({ email: createUniqueEmail('ppost'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    const self = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${authToken}`)
      .expect(200);
    profileId = self.body.data.id;

    // Create a post for the profile
    await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Profile post test' })
      .expect(201);
  });

  // ── GET /profile-post/:profileId ──────────────────────
  describe('GET /profile-post/:profileId', () => {
    it('should get posts for a profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profile-post/${profileId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/profile-post/${profileId}`)
        .expect(401);
    });
  });
});
