import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { createDataroomForUser } from './helpers/flow-helpers';

describe('IDOR Data Room Security (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let owner: { token: string; profileId: string };
  let outsiderToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    owner = await createAuthenticatedUser(app, request, 'idor-owner');
    const outsider = await createAuthenticatedUser(
      app,
      request,
      'idor-outsider',
    );
    outsiderToken = outsider.token;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('outsider receives 403 when accessing owner dataroom via GET /dataroom/:dataroomId', async () => {
    const { dataroomId } = await createDataroomForUser(app, request, owner, {
      prisma: context.prisma,
    });
    expect(dataroomId).toBeDefined();

    const outsiderRes = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${outsiderToken}`);

    expect(outsiderRes.status).toBe(403);
  });
});
