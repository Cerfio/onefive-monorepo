import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createPostData,
} from '../../test/helpers/fixtures';

describe('FeedExtraController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'feedextra');
    token = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('should list profile suggestions', async () => {
    const res = await request(app.getHttpServer())
      .get('/feed-extra/profile-suggestions?limit=10&skip=0')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should list startup suggestions', async () => {
    const res = await request(app.getHttpServer())
      .get('/feed-extra/startup-suggestions?limit=10&skip=0')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should toggle bookmark then list bookmarks', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send(createPostData({ content: 'Feed extra bookmark test post' }))
      .expect(201);

    const postId = postRes.body?.data?.id ?? postRes.body?.id;
    expect(postId).toBeDefined();

    const toggleRes = await request(app.getHttpServer())
      .post(`/feed-extra/bookmark/${postId}`)
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(toggleRes.body.success).toBe(true);
    expect(toggleRes.body.data).toBeDefined();
    expect(typeof toggleRes.body.data.bookmarked).toBe('boolean');

    const bookmarksRes = await request(app.getHttpServer())
      .get('/feed-extra/bookmarks?limit=10&skip=0')
      .set('Cookie', `token=${token}`)
      .expect(200);

    expect(bookmarksRes.body.success).toBe(true);
    expect(Array.isArray(bookmarksRes.body.data)).toBe(true);
    const hasBookmarkedPost = bookmarksRes.body.data.some(
      (item: any) => item.id === postId,
    );
    expect(hasBookmarkedPost).toBe(true);
  });
});
