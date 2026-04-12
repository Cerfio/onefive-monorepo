import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createDiscussionData,
} from '../../test/helpers/fixtures';

describe('DiscussionAnswerReactionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let discussionId: string;
  let answerId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'react');
    token = user.token;

    // Create a discussion
    const data = createDiscussionData();
    const discRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send(data);

    discussionId = discRes.body.data.id;

    // Create an answer on that discussion
    const ansRes = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Great question, here is my take on MVP validation.' });

    answerId = ansRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('POST /discussions/:discussionId/answers/:answerId/reaction - creates THUMBS_UP reaction (201)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers/${answerId}/reaction`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'THUMBS_UP' })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('DELETE /discussions/:discussionId/answers/:answerId/reaction - removes reaction (200)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/discussions/${discussionId}/answers/${answerId}/reaction`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'THUMBS_UP' })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('POST /discussions/:discussionId/answers/:answerId/reaction - creates HEART reaction (201)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers/${answerId}/reaction`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'HEART' })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('POST /discussions/:discussionId/answers/:answerId/reaction - without auth returns 401', async () => {
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers/${answerId}/reaction`)
      .send({ reaction: 'THUMBS_UP' })
      .expect(401);
  });

  it('POST /discussions/:discussionId/answers/:answerId/reaction - invalid reaction returns 400', async () => {
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers/${answerId}/reaction`)
      .set('Cookie', `token=${token}`)
      .send({ reaction: 'INVALID_REACTION' })
      .expect(400);
  });
});
