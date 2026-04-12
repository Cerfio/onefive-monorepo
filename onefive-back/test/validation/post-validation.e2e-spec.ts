import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../utils/fast-e2e-setup';
import { createAuthenticatedUser } from '../helpers/fixtures';
import { VALIDATION_LIMITS } from '../../src/common/constants/validation-limits.constants';

describe('Post Validation E2E Tests', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let sessionCookie: string;

  const mediaFixture = (i: number) => ({
    url: `https://example.com/image${i}.jpg`,
    mimeType: 'image/jpeg',
    fileName: `image${i}.jpg`,
    size: 1024,
  });

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'post-val');
    sessionCookie = `token=${user.token}`;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('accepts content at exact max length', async () => {
    const exactMaxContent = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX);

    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({ content: exactMaxContent, tags: ['NETWORKING'] })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  it('rejects content exceeding max length', async () => {
    const tooLongContent = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX + 1);

    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({ content: tooLongContent, tags: ['NETWORKING'] });

    expect([400, 500]).toContain(res.status);
  });

  it('accepts media count at max', async () => {
    const maxMedias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT)
      .fill(null)
      .map((_, i) => mediaFixture(i));

    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({
        content: 'Post with media',
        medias: maxMedias,
        tags: ['NETWORKING'],
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  it('rejects media count above max', async () => {
    const tooManyMedias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT + 1)
      .fill(null)
      .map((_, i) => mediaFixture(i));

    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({
        content: 'Too many media',
        medias: tooManyMedias,
        tags: ['NETWORKING'],
      });

    expect(res.status).toBe(400);
  });

  it('rejects post with more than 10 tags', async () => {
    const tooManyTags = Array(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT + 1)
      .fill('tag')
      .map((t, i) => `tag${i}`);

    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({ content: 'Post with too many tags', tags: tooManyTags });

    expect(res.status).toBe(400);
  });

  it('accepts post with exactly 10 tags', async () => {
    const maxTags = Array(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT)
      .fill('tag')
      .map((t, i) => `tag${i}`);

    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({ content: 'Post with max tags', tags: maxTags });

    expect([200, 201]).toContain(res.status);
  });

  it('validates comment content max length', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send({ content: 'Base post for comment test', tags: ['NETWORKING'] })
      .expect(201);

    const postId = postRes.body?.data?.id ?? postRes.body?.id;
    expect(postId).toBeDefined();

    const maxComment = 'a'.repeat(VALIDATION_LIMITS.POST_COMMENT.CONTENT_MAX);
    await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', sessionCookie)
      .send({ content: maxComment })
      .expect(201);

    const tooLongComment = 'a'.repeat(
      VALIDATION_LIMITS.POST_COMMENT.CONTENT_MAX + 1,
    );
    await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', sessionCookie)
      .send({ content: tooLongComment })
      .expect(400);
  });
});
