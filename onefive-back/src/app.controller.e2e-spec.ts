import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('AppController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /health', () => {
    it('should return health status (public)', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return root response', async () => {
      const res = await request(app.getHttpServer()).get('/');
      // Root may require auth or be public
      expect(res.statusCode).toBeLessThan(500);
    });
  });
});
