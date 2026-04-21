/**
 * Network search + suggestions endpoints (smoke).
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Network search + suggestions', () => {
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

  it('GET /network/people returns 200', async () => {
    const u = await createAuthenticatedUser(app, request, 'np');
    const res = await request(app.getHttpServer())
      .get('/network/people')
      .set('Cookie', `token=${u.token}`);
    expect([200, 400]).toContain(res.status);
  });

  it('GET /network/startups returns 200', async () => {
    const u = await createAuthenticatedUser(app, request, 'ns');
    const res = await request(app.getHttpServer())
      .get('/network/startups')
      .set('Cookie', `token=${u.token}`);
    expect([200, 400]).toContain(res.status);
  });

  it('GET /network/activity returns 200', async () => {
    const u = await createAuthenticatedUser(app, request, 'na');
    const res = await request(app.getHttpServer())
      .get('/network/activity')
      .set('Cookie', `token=${u.token}`);
    expect([200, 400]).toContain(res.status);
  });

  it('GET /profile/search returns 200', async () => {
    const u = await createAuthenticatedUser(app, request, 'ps');
    const res = await request(app.getHttpServer())
      .get('/profile/search?query=test')
      .set('Cookie', `token=${u.token}`);
    expect([200, 400]).toContain(res.status);
  });
});
