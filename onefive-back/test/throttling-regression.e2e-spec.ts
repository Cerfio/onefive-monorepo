/**
 * Throttling regression — vérifie que les @Throttle activés (signup 3/min,
 * signin 5/min) déclenchent bien des 429.
 *
 * SKIP_THROTTLE est lu au boot du ThrottlerModule, donc on doit le mettre
 * AVANT setupFastE2E.
 */
process.env.SKIP_THROTTLE = 'false'; // must be set before any import that reads it

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createUniqueEmail, validPassword } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Throttling regression', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
    process.env.SKIP_THROTTLE = 'true'; // restore for other test files
  });

  it('signup is throttled to 3 / minute (4th call → 429)', async () => {
    const responses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: createUniqueEmail(`thr-signup-${i}`), password: validPassword });
      responses.push(res.status);
    }

    // First 3 succeed (201), 4th and 5th should be 429
    const okCount = responses.filter((s) => [200, 201].includes(s)).length;
    const throttled = responses.filter((s) => s === 429).length;

    expect(okCount).toBeLessThanOrEqual(3);
    expect(throttled).toBeGreaterThanOrEqual(1);
  });

  it('signin is throttled to 5 / minute', async () => {
    // Use a single non-existent email — invalid creds, but we only care about throttle
    const responses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nonexistent@throttle.test', password: 'WrongPass123!' });
      responses.push(res.status);
    }

    const throttled = responses.filter((s) => s === 429).length;
    expect(throttled).toBeGreaterThanOrEqual(1);
  });
});
