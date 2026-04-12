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

describe('DiscussionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let profileId: string;
  let discussionId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'disc');
    token = user.token;
    profileId = user.profileId;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('POST /discussion - creates a discussion (201)', async () => {
    const data = createDiscussionData();
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send(data)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    discussionId = res.body.data.id;
  });

  it('GET /discussion - lists discussions (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discussion')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const isArrayPayload = Array.isArray(res.body.data);
    const isPaginatedPayload =
      res.body.data && Array.isArray(res.body.data.items || res.body.data.data);
    expect(isArrayPayload || isPaginatedPayload).toBe(true);
  });

  it('GET /discussion/:discussionId - gets single discussion (200)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/discussion/${discussionId}`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('PUT /discussion/:discussionId - updates discussion question (200)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/discussion/${discussionId}`)
      .set('Cookie', `token=${token}`)
      .send({ question: 'Updated question for MVP validation?' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('DELETE /discussion/:discussionId - deletes discussion (200)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/discussion/${discussionId}`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('POST /discussion - without auth returns 401', async () => {
    const data = createDiscussionData();
    await request(app.getHttpServer())
      .post('/discussion')
      .send(data)
      .expect(401);
  });

  it('POST /discussion - question too short returns 400', async () => {
    const data = createDiscussionData();
    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send({ ...data, question: 'Hi' })
      .expect(400);
  });

  it('POST /discussion - without tags returns 400', async () => {
    const data = createDiscussionData();
    const { tags, ...withoutTags } = data;
    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send(withoutTags)
      .expect(400);
  });
});
