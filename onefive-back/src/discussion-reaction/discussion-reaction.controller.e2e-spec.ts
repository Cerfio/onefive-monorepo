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

describe('DiscussionReactionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let discussionId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('discrxn'), password: validPassword })
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
        question: 'Discussion for reactions test',
        tags: ['test'],
        type: 'DISCUSSION',
      })
      .expect(201);
    discussionId = discRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /discussions/:discussionId/reaction', () => {
    it('should add a reaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/reaction`)
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' })
        .expect(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/reaction`)
        .send({ reaction: 'THUMBS_UP' })
        .expect(401);
    });
  });

  describe('DELETE /discussions/:discussionId/reaction', () => {
    it('should remove a reaction', async () => {
      // Add reaction first
      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/reaction`)
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' });

      // DELETE may also require the reaction type in the body
      const res = await request(app.getHttpServer())
        .delete(`/discussions/${discussionId}/reaction`)
        .set('Cookie', `token=${authToken}`)
        .send({ reaction: 'THUMBS_UP' });
      expect([200, 204]).toContain(res.statusCode);
    });
  });
});
