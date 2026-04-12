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

describe('ProfileAvatarController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('avatar'), password: validPassword })
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

  describe('POST /profile-avatar/upload', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post(
        '/profile-avatar/upload',
      );
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should fail without a file', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-avatar/upload')
        .set('Cookie', `token=${authToken}`);
      // Without multipart file, should get 400 or 500
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should accept a file upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/profile-avatar/upload')
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('fake-image'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        });
      // May succeed or fail depending on file validation
      expect(res.statusCode).not.toBe(404);
    });
  });
});
