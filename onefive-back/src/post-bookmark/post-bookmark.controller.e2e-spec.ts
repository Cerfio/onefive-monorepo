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

describe('PostBookmarkController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let postId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('pbkm'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a post to bookmark
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Bookmark test post' })
      .expect(201);
    postId = postRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /post-bookmark/:postId', () => {
    it('should bookmark a post', async () => {
      const res = await request(app.getHttpServer())
        .post(`/post-bookmark/${postId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/post-bookmark/${postId}`)
        .expect(401);
    });
  });

  describe('GET /post-bookmark', () => {
    it('should get bookmarked posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/post-bookmark')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /post-bookmark/:postId', () => {
    it('should remove a bookmark', async () => {
      // Ensure it is bookmarked
      await request(app.getHttpServer())
        .post(`/post-bookmark/${postId}`)
        .set('Cookie', `token=${authToken}`);

      const res = await request(app.getHttpServer())
        .delete(`/post-bookmark/${postId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /post-bookmark/toggle/:postId', () => {
    it('should toggle bookmark', async () => {
      const res = await request(app.getHttpServer())
        .put(`/post-bookmark/toggle/${postId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
