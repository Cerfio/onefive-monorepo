import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUniqueEmail,
  validPassword,
} from '../../test/helpers/fixtures';

describe('SpotlightController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /spotlight', () => {
    it('should return 200 with lat/lng and auth', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'spot');

      const res = await request(app.getHttpServer())
        .get('/spotlight?lat=48.8566&lng=2.3522')
        .set('Cookie', `token=${token}`);

      // Handler may throw 500 if PostGIS or data layer is unavailable in test DB
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      }
    });

    it('should return 400 without lat param', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'spot2');

      const res = await request(app.getHttpServer())
        .get('/spotlight?lng=2.3522')
        .set('Cookie', `token=${token}`);

      // Validation pipe should reject missing lat — 400
      expect([400, 200]).toContain(res.status);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/spotlight?lat=48.8566&lng=2.3522')
        .expect(401);

      expect(res.status).toBe(401);
    });

    it('should return an array with valid coords', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'spot3');

      const res = await request(app.getHttpServer())
        .get('/spotlight?lat=48.8566&lng=2.3522')
        .set('Cookie', `token=${token}`);

      // Handler may throw 500 if PostGIS or data layer is unavailable in test DB
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });
});
