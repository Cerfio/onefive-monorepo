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

describe('PostCommentReactionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('pcr'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a post
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Comment reaction test post' })
      .expect(201);
    postId = postRes.body.data.id;

    // Create a comment
    const commentRes = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Test comment' })
      .expect(201);
    commentId = commentRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /post-comment-reactions/comments/:commentId', () => {
    it('should add a reaction to a comment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/post-comment-reactions/comments/${commentId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' })
        .expect(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/post-comment-reactions/comments/${commentId}`)
        .send({ reaction: 'THUMBS_UP' })
        .expect(401);
    });
  });

  describe('GET /post-comment-reactions/comments/:commentId', () => {
    it('should get reactions for a comment', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post-comment-reactions/comments/${commentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /post-comment-reactions/comments/:commentId', () => {
    it('should update a comment reaction', async () => {
      const res = await request(app.getHttpServer())
        .put(`/post-comment-reactions/comments/${commentId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'HEART' })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /post-comment-reactions/comments/:commentId', () => {
    it('should delete a comment reaction', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/post-comment-reactions/comments/${commentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
