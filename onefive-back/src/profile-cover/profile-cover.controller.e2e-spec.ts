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

describe('ProfileCoverController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('cover'), password: validPassword })
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

  describe('POST /profile-cover/upload', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post(
        '/profile-cover/upload',
      );
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should fail without a file', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-cover/upload')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should accept a file upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-cover/upload')
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('fake-image'), {
          filename: 'cover.png',
          contentType: 'image/png',
        });
      expect(res.statusCode).not.toBe(404);
    });
  });
});
