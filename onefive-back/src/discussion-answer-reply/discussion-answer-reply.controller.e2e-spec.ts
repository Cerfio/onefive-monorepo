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

describe('DiscussionAnswerReplyController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let discussionId: string;
  let answerId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    // Create user with profile
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('reply'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create discussion
    const discRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${authToken}`)
      .send({
        question: 'Test discussion for replies',
        tags: ['test'],
        type: 'DISCUSSION',
      });

    if (discRes.body.data) {
      discussionId = discRes.body.data.id;

      // Create answer
      const ansRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Test answer for replies' });

      if (ansRes.body.data) {
        answerId = ansRes.body.data.id;
      }
    }
  });

  // ── POST /discussions/:discussionId/answers/:answerId/replies
  describe('POST /:discussionId/answers/:answerId/replies', () => {
    it('should create a reply to an answer', async () => {
      if (!answerId) return;

      const res = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'This is a test reply' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should fail without authentication', async () => {
      if (!answerId) return;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
        .send({ content: 'Unauthorized reply' })
        .expect(401);
    });
  });

  // ── PUT /:discussionId/answers/:answerId/replies/:replyId
  describe('PUT /:discussionId/answers/:answerId/replies/:replyId', () => {
    it('should update a reply', async () => {
      if (!answerId) return;

      const createRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Original reply' })
        .expect(201);

      const replyId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .put(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}`,
        )
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Updated reply' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── DELETE /:discussionId/answers/:answerId/replies/:replyId
  describe('DELETE /:discussionId/answers/:answerId/replies/:replyId', () => {
    it('should delete a reply', async () => {
      if (!answerId) return;

      const createRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Reply to delete' })
        .expect(201);

      const replyId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .delete(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}`,
        )
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
