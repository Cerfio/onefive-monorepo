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

describe('DiscussionAnswerController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let discussionId: string;
  let answerId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'ans');
    token = user.token;

    // Create a discussion to attach answers to
    const data = createDiscussionData();
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send(data);

    discussionId = res.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('POST /discussions/:discussionId/answers - creates an answer (201)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${token}`)
      .send({
        content: 'Start by talking to potential users and validating demand.',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    answerId = res.body.data.id;
  });

  it('PUT /discussions/:discussionId/answers/:answerId - updates an answer (200)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/discussions/${discussionId}/answers/${answerId}`)
      .set('Cookie', `token=${token}`)
      .send({
        content: 'Updated: Build a landing page and measure conversion first.',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('DELETE /discussions/:discussionId/answers/:answerId - deletes an answer (200)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/discussions/${discussionId}/answers/${answerId}`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('POST /discussions/:discussionId/answers - without auth returns 401', async () => {
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .send({ content: 'Unauthorized answer attempt.' })
      .expect(401);
  });

  it('POST /discussions/:discussionId/answers - empty content returns 400', async () => {
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${token}`)
      .send({ content: '' })
      .expect(400);
  });

  it('POST /discussions/:nonExistentId/answers - non-existent discussion should fail', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app.getHttpServer())
      .post(`/discussions/${fakeId}/answers`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Answer to nowhere.' });

    expect([400, 404, 500]).toContain(res.status);
  });
});
