/**
 * Spotlight — public list endpoint smoke + PostGIS geosearch.
 * Admin CRUD passe par /admin/spotlight (cookie admin séparé) — non couvert
 * ici, voir admin-backoffice tests pour cela.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Spotlight public list + geosearch', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('GET /spotlight without lat/lng → 400 (params required)', async () => {
    const u = await createAuthenticatedUser(app, request, 'sp-noparams');
    const res = await request(app.getHttpServer())
      .get('/spotlight')
      .set('Cookie', `token=${u.token}`);
    expect(res.status).toBe(400);
  });

  it('GET /spotlight with lat/lng → 200', async () => {
    const u = await createAuthenticatedUser(app, request, 'sp-geo');
    const res = await request(app.getHttpServer())
      .get('/spotlight?lat=48.8566&lng=2.3522&take=10')
      .set('Cookie', `token=${u.token}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('lat without lng → 400 (both required)', async () => {
    const u = await createAuthenticatedUser(app, request, 'sp-partial');
    const res = await request(app.getHttpServer())
      .get('/spotlight?lat=48.8566')
      .set('Cookie', `token=${u.token}`);
    expect(res.status).toBe(400);
  });

  it('GET /spotlight without auth is rejected (SessionGuard global)', async () => {
    const res = await request(app.getHttpServer()).get('/spotlight');
    expect([401, 403]).toContain(res.status);
  });
});
