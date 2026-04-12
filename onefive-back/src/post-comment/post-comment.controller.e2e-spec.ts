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

describe('PostCommentController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let profileId: string;
  let userId: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'comment');
    token = user.token;
    profileId = user.profileId;
    userId = user.userId;

    // Create a post to comment on
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send({ content: 'Post for comment tests', tags: ['test'] });

    expect(postRes.status).toBe(201);
    expect(postRes.body.success).toBe(true);
    postId = postRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('POST /post-comments/posts/:postId - creates a comment (201)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'This is a test comment' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    commentId = res.body.data.id;
  });

  it('GET /post-comments/posts/:postId - lists comments for the post (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /post-comments/:id - gets a single comment (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/post-comments/${commentId}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(commentId);
  });

  it('PUT /post-comments/:id - updates a comment (200)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/post-comments/${commentId}`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Updated comment content' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /post-comments/:id - deletes a comment (200)', async () => {
    // Create a comment specifically for deletion
    const createRes = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Comment to delete' });

    expect(createRes.status).toBe(201);
    const deleteTargetId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .delete(`/post-comments/${deleteTargetId}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /post-comments/posts/:postId - without content field returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /post-comments/posts/:postId - without auth returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .send({ content: 'No auth comment' });

    expect(res.status).toBe(401);
  });

  it('POST /post-comments/posts/:nonExistentPostId - to non-existent post fails', async () => {
    const fakePostId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${fakePostId}`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Comment on ghost post' });

    expect([404, 500]).toContain(res.status);
  });

  it('POST /post-comments/posts/:postId - creates a reply with parentId', async () => {
    // commentId from the first test is still valid (we only deleted a different one)
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'This is a reply', parentId: commentId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});
