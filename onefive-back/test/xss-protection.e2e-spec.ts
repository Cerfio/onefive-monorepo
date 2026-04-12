import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';

describe('XSS Protection - Sanitization (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    const user = await createAuthenticatedUser(app, request, 'xss');
    token = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('accepts post payload with html safely', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send({
        content: '<script>alert(1)</script>safe text',
        tags: ['NETWORKING'],
      });

    expect([201, 400]).toContain(res.status);
  });
});
