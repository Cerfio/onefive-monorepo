import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUniqueEmail,
  validPassword,
} from '../../test/helpers/fixtures';

describe('PostReactionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let profileId: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'reaction');
    token = user.token;
    profileId = user.profileId;
    userId = user.userId;

    // Create a post to react to
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send({ content: 'Post for reaction tests', tags: ['test'] });

    expect(postRes.status).toBe(201);
    expect(postRes.body.success).toBe(true);
    postId = postRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('POST /post-reactions/posts/:postId - creates a reaction (201)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'THUMBS_UP' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /post-reactions/posts/:postId - lists reactions (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('PUT /post-reactions/posts/:postId - updates reaction to HEART (200)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'HEART' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /post-reactions/posts/:postId - removes reaction (200)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /post-reactions/posts/:postId - without auth returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-reactions/posts/${postId}`)
      .send({ reaction: 'THUMBS_UP' });

    expect(res.status).toBe(401);
  });

  it('POST /post-reactions/posts/:postId - with invalid reaction type returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'INVALID_REACTION' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
