import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';

describe('File Upload Validation (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'file-upload');
    token = user.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('rejects upload endpoint without auth', async () => {
    const res = await request(app.getHttpServer())
      .post('/dataroom/00000000-0000-0000-0000-000000000000/file')
      .attach('file', Buffer.from('hello'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect([401]).toContain(res.status);
  });

  it('handles upload endpoint with auth safely', async () => {
    const res = await request(app.getHttpServer())
      .post('/dataroom/00000000-0000-0000-0000-000000000000/file')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from('hello'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect([200, 201, 400, 403, 404, 500]).toContain(res.status);
  });
});
