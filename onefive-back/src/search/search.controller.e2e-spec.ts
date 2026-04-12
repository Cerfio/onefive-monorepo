import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('SearchController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('search'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /search/searchbar', () => {
    it('should search via searchbar', async () => {
      const res = await request(app.getHttpServer())
        .get('/search/searchbar?q=test')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with q shorter than 2 chars', async () => {
      await request(app.getHttpServer())
        .get('/search/searchbar?q=a')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });

    it('should fail without q param', async () => {
      await request(app.getHttpServer())
        .get('/search/searchbar')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/search/searchbar?q=test',
      );
      // ThrottlerGuard (rate limiting) may return 429 before SessionGuard returns 401
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /search', () => {
    it('should perform global search', async () => {
      const res = await request(app.getHttpServer())
        .get('/search?q=test')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without q param', async () => {
      await request(app.getHttpServer())
        .get('/search')
        .set('Cookie', `token=${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/search?q=test');
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should reject limit>100 with 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/search?q=test&limit=101')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBe(400);
    });

    it('should reject limit=0 with 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/search?q=test&limit=0')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBe(400);
    });
  });
});
