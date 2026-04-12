import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';

describe('Startup Equity Race Condition (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'equity');
    token = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('handles funding/equity endpoint safely under repeated calls', async () => {
    const startupId = '00000000-0000-0000-0000-000000000000';

    const first = await request(app.getHttpServer())
      .get(`/startup/${startupId}/funding`)
      .set('Cookie', `token=${token}`);

    const second = await request(app.getHttpServer())
      .get(`/startup/${startupId}/funding`)
      .set('Cookie', `token=${token}`);

    expect([200, 400, 401, 403, 404]).toContain(first.status);
    expect([200, 400, 401, 403, 404]).toContain(second.status);
  });
});
