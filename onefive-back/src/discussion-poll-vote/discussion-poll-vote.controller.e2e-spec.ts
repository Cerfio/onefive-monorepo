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

describe('DiscussionPollVoteController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let pollDiscussionId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('poll'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a POLL discussion (options min 2)
    const discRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${authToken}`)
      .send({
        question: 'Which framework do you prefer?',
        tags: ['poll'],
        type: 'POLL',
        options: ['React', 'Vue', 'Angular', 'Svelte'],
      })
      .expect(201);
    pollDiscussionId = discRes.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /discussions/:discussionId/poll-vote', () => {
    it('should vote on a poll', async () => {
      const res = await request(app.getHttpServer())
        .post(`/discussions/${pollDiscussionId}/poll-vote`)
        .set('Cookie', `token=${authToken}`)
        .send({ options: ['React'] });
      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/discussions/${pollDiscussionId}/poll-vote`)
        .send({ options: ['React'] })
        .expect(401);
    });
  });
});
