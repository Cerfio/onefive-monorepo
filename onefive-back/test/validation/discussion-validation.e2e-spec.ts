import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../utils/fast-e2e-setup';
import { createAuthenticatedUser } from '../helpers/fixtures';
import { VALIDATION_LIMITS } from '../../src/common/constants/validation-limits.constants';

describe('Discussion Validation E2E Tests', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let sessionCookie: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'disc-val');
    sessionCookie = `token=${user.token}`;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('accepts valid discussion at question boundaries', async () => {
    const minQuestion = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN);
    const maxQuestion = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX);

    const minRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: minQuestion, tags: ['NETWORKING'], type: 'DISCUSSION' })
      .expect(201);

    const maxRes = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: maxQuestion, tags: ['NETWORKING'], type: 'DISCUSSION' })
      .expect(201);

    expect(minRes.body).toBeDefined();
    expect(maxRes.body).toBeDefined();
  });

  it('rejects invalid question lengths', async () => {
    const tooShort = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN - 1);
    const tooLong = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX + 1);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: tooShort, tags: ['NETWORKING'], type: 'DISCUSSION' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: tooLong, tags: ['NETWORKING'], type: 'DISCUSSION' })
      .expect(400);
  });

  it('accepts valid content and tags boundaries', async () => {
    const maxContent = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX);
    const maxTags = Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT).fill('NETWORKING');

    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({
        question: 'Valid discussion question',
        content: maxContent,
        tags: maxTags,
        type: 'DISCUSSION',
      })
      .expect(201);

    expect(res.body).toBeDefined();
  });

  it('rejects invalid tags boundaries', async () => {
    const tooManyTags = Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT + 1).fill('NETWORKING');

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid question', tags: [], type: 'DISCUSSION' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid question', tags: tooManyTags, type: 'DISCUSSION' })
      .expect(400);
  });

  it('accepts and rejects poll options boundaries', async () => {
    const minOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT).fill('Option');
    const maxOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT).fill('Option');
    const tooManyOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT + 1).fill('Option');

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid poll?', options: minOptions, tags: ['NETWORKING'], type: 'POLL' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid poll?', options: maxOptions, tags: ['NETWORKING'], type: 'POLL' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid poll?', options: ['Only one option'], tags: ['NETWORKING'], type: 'POLL' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', sessionCookie)
      .send({ question: 'Valid poll?', options: tooManyOptions, tags: ['NETWORKING'], type: 'POLL' })
      .expect(400);
  });

  it('rejects pagination limit above max', async () => {
    await request(app.getHttpServer())
      .get(`/discussion?limit=${VALIDATION_LIMITS.PAGINATION.TAKE_MAX + 1}&offset=0`)
      .set('Cookie', sessionCookie)
      .expect(400);
  });

  it('rejects negative offset', async () => {
    await request(app.getHttpServer())
      .get('/discussion?limit=10&offset=-1')
      .set('Cookie', sessionCookie)
      .expect(400);
  });
});
