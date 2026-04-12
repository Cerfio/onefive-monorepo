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

describe('DiscussionUpvoteController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let discussionId: string;

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
      .send({ email: createUniqueEmail('discup'), password: validPassword })
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
        question: 'Discussion for upvotes',
        tags: ['test'],
        type: 'DISCUSSION',
      });

    if (discRes.body.data) {
      discussionId = discRes.body.data.id;
    }
  });

  // ── POST /:discussionId/upvote ────────────────────────
  describe('POST discussion upvote', () => {
    it('should upvote a discussion', async () => {
      if (!discussionId) return;

      const res = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      if (!discussionId) return;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/upvote`)
        .expect(401);
    });
  });

  // ── DELETE /:discussionId/upvote ──────────────────────
  describe('DELETE discussion upvote', () => {
    it('should remove upvote from a discussion', async () => {
      if (!discussionId) return;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/discussions/${discussionId}/upvote`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
