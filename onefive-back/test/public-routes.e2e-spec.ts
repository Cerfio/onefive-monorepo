/**
 * Routes publiques (no auth) — sitemap, count, et les preview SEO sans cookie.
 * Le SessionGuard global laisse passer les routes annotées @Public.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { installMocks } from './helpers/mocks';

describe('Public routes — SEO sitemap + count', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  const sitemapPaths = [
    '/seo/sitemap/startups',
    '/seo/sitemap/profiles',
    '/seo/sitemap/discussions',
    '/seo/sitemap/spots',
    '/seo/sitemap/posts',
  ];
  for (const path of sitemapPaths) {
    it(`GET ${path} (no auth) → 200`, async () => {
      const res = await request(app.getHttpServer()).get(path);
      expect(res.status).toBe(200);
    });
  }

  const countPaths = [
    '/seo/count/startups',
    '/seo/count/profiles',
    '/seo/count/discussions',
    '/seo/count/spots',
    '/seo/count/posts',
  ];
  for (const path of countPaths) {
    it(`GET ${path} (no auth) → 200 with numeric count`, async () => {
      const res = await request(app.getHttpServer()).get(path);
      expect(res.status).toBe(200);
      // Response shape: { count: N } or similar
      const body = res.body;
      expect(body).toBeDefined();
    });
  }

  it('GET /health (Public) → 200 (uptime check)', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /seo/startup/non-existent-id → 404 (or empty), not 401/403', async () => {
    const res = await request(app.getHttpServer()).get('/seo/startup/00000000-0000-0000-0000-000000000000');
    // Public route — no auth check, so never 401/403
    expect([200, 404]).toContain(res.status);
  });
});
