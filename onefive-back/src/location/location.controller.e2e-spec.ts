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

describe('LocationController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /location/cities/suggestions', () => {
    it('should return suggestions for Paris + FR → 201', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'loc1');

      const res = await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .set('Cookie', `token=${token}`)
        .send({ query: 'Paris', countryCode: 'FR' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('name');
        expect(res.body.data[0]).toHaveProperty('placeId');
        expect(res.body.data[0]).toHaveProperty('structuredFormatting');
      }
    });

    it('should return suggestions for New York + US → 201', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'loc2');

      const res = await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .set('Cookie', `token=${token}`)
        .send({ query: 'New York', countryCode: 'US' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return empty array for unknown country XX → 201', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'loc3');

      const res = await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .set('Cookie', `token=${token}`)
        .send({ query: 'Paris', countryCode: 'XX' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 400 for query too short (1 char)', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'loc4');

      await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .set('Cookie', `token=${token}`)
        .send({ query: 'P', countryCode: 'FR' })
        .expect(400);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .send({ query: 'Paris', countryCode: 'FR' })
        .expect(401);
    });

    it('should return results for partial match Par + FR → 201', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'loc5');

      const res = await request(app.getHttpServer())
        .post('/location/cities/suggestions')
        .set('Cookie', `token=${token}`)
        .send({ query: 'Par', countryCode: 'FR' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
