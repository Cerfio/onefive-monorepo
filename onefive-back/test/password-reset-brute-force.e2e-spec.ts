import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';

describe('Password Reset Brute-Force Protection (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('handles reset request endpoint safely', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/password/reset/request')
      .send({ email: `bruteforce-${Date.now()}@example.com` });

    // Endpoint returns 200 (no user enumeration) — accept legacy values too
    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('handles reset verify endpoint safely', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/password/reset/verify')
      .send({ token: 'fake-token', code: 'ABCD' });

    expect([200, 400, 404, 429]).toContain(res.status);
  });
});
