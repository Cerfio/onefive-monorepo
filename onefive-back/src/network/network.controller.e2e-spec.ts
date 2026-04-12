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

describe('NetworkController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let otherToken: string;
  let otherProfileId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    // User A
    const signupA = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('netA'), password: validPassword })
      .expect(201);
    authToken = signupA.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // User B
    const signupB = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('netB'), password: validPassword })
      .expect(201);
    otherToken = signupB.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${otherToken}`)
      .send(createProfileData({ firstName: 'Jane', lastName: 'Smith' }))
      .expect(201);

    const selfB = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${otherToken}`)
      .expect(200);
    otherProfileId = selfB.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /network/activity', () => {
    it('should get network activity', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/activity')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/network/activity');
      // ThrottlerGuard may return 429 before SessionGuard returns 401
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /network/people', () => {
    it('should get people with view=discover', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/people?view=discover')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should get people with view=network', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/people?view=network')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without view param', async () => {
      await request(app.getHttpServer())
        .get('/network/people')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/network/people?view=discover',
      );
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should reject limit>100 with 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/people?view=discover&limit=101')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBe(400);
    });

    it('should reject offset<0 with 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/people?view=discover&offset=-1')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /network/startups', () => {
    it('should get startups with view=discover', async () => {
      const res = await request(app.getHttpServer())
        .get('/network/startups?view=discover')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without view param', async () => {
      await request(app.getHttpServer())
        .get('/network/startups')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });
  });

  describe('POST /network/connect/:profileId', () => {
    it('should send a connection request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/network/connect/${otherProfileId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post(
        `/network/connect/${otherProfileId}`,
      );
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('POST /network/follow/profile/:profileId', () => {
    it('should follow a profile', async () => {
      const res = await request(app.getHttpServer())
        .post(`/network/follow/profile/${otherProfileId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /network/follow/profile/:profileId', () => {
    it('should unfollow a profile', async () => {
      // Follow first
      await request(app.getHttpServer())
        .post(`/network/follow/profile/${otherProfileId}`)
        .set('Cookie', `token=${authToken}`);

      const res = await request(app.getHttpServer())
        .delete(`/network/follow/profile/${otherProfileId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
