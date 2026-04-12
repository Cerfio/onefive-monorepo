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

describe('DiscussionAnswerUpvoteController (e2e)', () => {
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
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('ansup'), password: validPassword })
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
        question: 'Discussion for answer upvotes',
        tags: ['test'],
        type: 'DISCUSSION',
      });

    if (discRes.body.data) {
      discussionId = discRes.body.data.id;

      const ansRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Answer to upvote' });

      if (ansRes.body.data) {
        answerId = ansRes.body.data.id;
      }
    }
  });

  // ── POST /:answerId/upvote ────────────────────────────
  describe('POST answer upvote', () => {
    it('should upvote an answer', async () => {
      if (!answerId) return;

      const res = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      if (!answerId) return;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/upvote`)
        .expect(401);
    });
  });

  // ── DELETE /:answerId/upvote ──────────────────────────
  describe('DELETE answer upvote', () => {
    it('should remove upvote from an answer', async () => {
      if (!answerId) return;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers/${answerId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/discussions/${discussionId}/answers/${answerId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
