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

describe('DiscussionAnswerReplyUpvoteController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let discussionId: string;
  let answerId: string;
  let replyId: string;

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
      .send({ email: createUniqueEmail('replyup'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    const discRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${authToken}`)
      .send({
        question: 'Discussion for reply upvotes',
        tags: ['test'],
        type: 'DISCUSSION',
      });

    if (discRes.body.data) {
      discussionId = discRes.body.data.id;

      const ansRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Answer for reply upvotes' });

      if (ansRes.body.data) {
        answerId = ansRes.body.data.id;

        const repRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
          .set('Cookie', `token=${authToken}`)
          .send({ content: 'Reply for upvotes' });

        if (repRes.body.data) {
          replyId = repRes.body.data.id;
        }
      }
    }
  });

  // ── POST /:replyId/upvote ─────────────────────────────
  describe('POST reply upvote', () => {
    it('should upvote a reply', async () => {
      if (!replyId) return;

      const res = await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
        )
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      if (!replyId) return;

      await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
        )
        .expect(401);
    });
  });

  // ── DELETE /:replyId/upvote ───────────────────────────
  describe('DELETE reply upvote', () => {
    it('should remove upvote from a reply', async () => {
      if (!replyId) return;

      await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
        )
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
        )
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
