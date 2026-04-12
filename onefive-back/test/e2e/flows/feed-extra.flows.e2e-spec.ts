/**
 * Feed Extra E2E Tests
 *
 * Tests feed-extra endpoints:
 * - Profile suggestions
 * - Startup suggestions
 * - Profile statistics
 * - Bookmarks
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import { completeUserRegistration } from '../../helpers/flow-helpers';

describe('Feed Extra Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('Profile Suggestions', () => {
    it('should return profile suggestions for authenticated user', async () => {
      const user = await completeUserRegistration(app, request, 'feedsugg');

      const res = await request(app.getHttpServer())
        .get('/feed-extra/profile-suggestions?limit=10&skip=0')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should require authentication for profile suggestions', async () => {
      const res = await request(app.getHttpServer()).get(
        '/feed-extra/profile-suggestions?limit=10',
      );

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Startup Suggestions', () => {
    it('should return startup suggestions for authenticated user', async () => {
      const user = await completeUserRegistration(app, request, 'feedstartsugg');

      const res = await request(app.getHttpServer())
        .get('/feed-extra/startup-suggestions?limit=10&skip=0')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should require authentication for startup suggestions', async () => {
      const res = await request(app.getHttpServer()).get(
        '/feed-extra/startup-suggestions?limit=10',
      );

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Profile Statistics', () => {
    it('should return profile statistics for authenticated user', async () => {
      const user = await completeUserRegistration(app, request, 'feedstats');

      const res = await request(app.getHttpServer())
        .get('/feed-extra/profile-statistics')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should require authentication for profile statistics', async () => {
      const res = await request(app.getHttpServer()).get(
        '/feed-extra/profile-statistics',
      );

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Bookmarks', () => {
    it('should list bookmarks for authenticated user', async () => {
      const user = await completeUserRegistration(app, request, 'feedbook');

      const res = await request(app.getHttpServer())
        .get('/feed-extra/bookmarks?limit=10&skip=0')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should toggle bookmark on a post', async () => {
      const user = await completeUserRegistration(app, request, 'feedbooktog');
      const author = await completeUserRegistration(app, request, 'feedbookauth');

      // Author creates a post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Post to bookmark' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        const bookmarkRes = await request(app.getHttpServer())
          .post(`/feed-extra/bookmark/${postId}`)
          .set('Cookie', `token=${user.token}`)
          .expect(200);

        expect(bookmarkRes.body.success).toBe(true);
        expect(bookmarkRes.body.data).toBeDefined();
        expect(typeof bookmarkRes.body.data.bookmarked).toBe('boolean');
      }
    });

    it('should require authentication for bookmarks', async () => {
      const res = await request(app.getHttpServer()).get(
        '/feed-extra/bookmarks?limit=10',
      );

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Pagination Validation', () => {
    it('profile-suggestions: limit>20 returns 400', async () => {
      const user = await completeUserRegistration(app, request, 'fepagprof');

      const limitRes = await request(app.getHttpServer())
        .get('/feed-extra/profile-suggestions?limit=21&skip=0')
        .set('Cookie', `token=${user.token}`);
      expect(limitRes.status).toBe(400);
    });

    it('profile-suggestions: skip<0 returns 400', async () => {
      const user = await completeUserRegistration(app, request, 'fepagprof2');

      const skipRes = await request(app.getHttpServer())
        .get('/feed-extra/profile-suggestions?limit=10&skip=-1')
        .set('Cookie', `token=${user.token}`);
      expect(skipRes.status).toBe(400);
    });

    it('startup-suggestions: limit>20 returns 400', async () => {
      const user = await completeUserRegistration(app, request, 'fepagstart');

      const limitRes = await request(app.getHttpServer())
        .get('/feed-extra/startup-suggestions?limit=21&skip=0')
        .set('Cookie', `token=${user.token}`);
      expect(limitRes.status).toBe(400);
    });

    it('bookmarks: limit>max returns 400', async () => {
      const user = await completeUserRegistration(app, request, 'fepagbook');

      const limitRes = await request(app.getHttpServer())
        .get('/feed-extra/bookmarks?limit=101&skip=0')
        .set('Cookie', `token=${user.token}`);
      expect([400]).toContain(limitRes.status);
    });
  });
});
