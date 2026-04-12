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

describe('ProfileFollowController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let tokenA: string;
  let profileIdA: string;
  let tokenB: string;
  let profileIdB: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    const signupA = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('pfA'), password: validPassword })
      .expect(200);
    tokenA = signupA.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${tokenA}`)
      .send(createProfileData({ firstName: 'Alice' }))
      .expect(200);
    const selfA = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${tokenA}`)
      .expect(200);
    profileIdA = selfA.body.data.id;

    const signupB = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('pfB'), password: validPassword })
      .expect(200);
    tokenB = signupB.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${tokenB}`)
      .send(createProfileData({ firstName: 'Bob' }))
      .expect(200);
    const selfB = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${tokenB}`)
      .expect(200);
    profileIdB = selfB.body.data.id;
  });

  // ── POST /profiles/:profileId/follow ──────────────────
  describe('POST /profiles/:profileId/follow', () => {
    it('should follow a profile', async () => {
      const res = await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/follow`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/follow`)
        .expect(401);
    });
  });

  // ── DELETE /profiles/:profileId/follow ────────────────
  describe('DELETE /profiles/:profileId/follow', () => {
    it('should unfollow a profile', async () => {
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/follow`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .delete(`/profiles/${profileIdB}/follow`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── GET /profiles/:profileId/is-following ─────────────
  describe('GET /profiles/:profileId/is-following', () => {
    it('should check follow status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${profileIdB}/is-following`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.isFollowing).toBe('boolean');
    });
  });

  // ── GET /profiles/:profileId/followers ────────────────
  describe('GET /profiles/:profileId/followers', () => {
    it('should get followers of a profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${profileIdB}/followers`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // ── GET /profiles/:profileId/following ────────────────
  describe('GET /profiles/:profileId/following', () => {
    it('should get following list', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${profileIdA}/following`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
