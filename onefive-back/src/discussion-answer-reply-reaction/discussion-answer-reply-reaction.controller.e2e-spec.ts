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

describe('DiscussionAnswerReplyReactionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let discussionId: string;
  let answerId: string;
  let replyId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('replyrxn'), password: validPassword })
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
        question: 'Discussion for reply reactions',
        tags: ['test'],
        type: 'DISCUSSION',
      })
      .expect(201);
    discussionId = discRes.body.data.id;

    // Create answer
    const ansRes = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Answer for reply reactions' })
      .expect(201);
    answerId = ansRes.body.data.id;

    // Create reply
    const repRes = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
      .set('Cookie', `token=${authToken}`)
      .send({ content: 'Reply for reactions' })
      .expect(201);
    replyId = repRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST reply reaction', () => {
    it('should add a reaction to a reply', async () => {
      const res = await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
        )
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' })
        .expect(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
        )
        .send({ reaction: 'THUMBS_UP' })
        .expect(401);
    });
  });

  describe('DELETE reply reaction', () => {
    it('should remove a reaction from a reply', async () => {
      // Add reaction first
      await request(app.getHttpServer())
        .post(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
        )
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' });

      // DELETE may require body with reaction type
      const res = await request(app.getHttpServer())
        .delete(
          `/discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
        )
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' });
      expect([200, 204]).toContain(res.statusCode);
    });
  });
});
