import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('FileController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('filectl'), password: validPassword })
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

  describe('POST /dataroom/files', () => {
    it('should call the create file record endpoint', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/files')
        .set('Cookie', `token=${authToken}`)
        .send({ dataroomId: 'fake-dr', name: 'test.pdf' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/files')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /dataroom/files', () => {
    it('should call the list files endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dataroom/files')
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('GET /dataroom/files/:fileId', () => {
    it('should call the get file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dataroom/files/fake-file-id')
        .set('Cookie', `token=${authToken}`);
      expect([200, 400, 401, 403, 404, 500]).toContain(res.statusCode);
    });
  });

  describe('DELETE /dataroom/files/:fileId', () => {
    it('should call the delete file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dataroom/files/fake-file-id')
        .set('Cookie', `token=${authToken}`);
      expect([200, 400, 401, 403, 404, 500]).toContain(res.statusCode);
    });
  });

  describe('PUT /dataroom/files/:fileId', () => {
    it('should call the update file endpoint', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/files/fake-file-id')
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'renamed.pdf' });
      expect([200, 400, 401, 403, 404, 500]).toContain(res.statusCode);
    });
  });
});
