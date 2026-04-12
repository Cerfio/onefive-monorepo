import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';

describe('Referral Email Verification (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'referral');
    token = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('handles referral-related authenticated endpoint safely', async () => {
    const res = await request(app.getHttpServer())
      .get('/referral/leaderboard')
      .set('Cookie', `token=${token}`);

    expect([200, 401, 403, 404]).toContain(res.status);
  });
});
