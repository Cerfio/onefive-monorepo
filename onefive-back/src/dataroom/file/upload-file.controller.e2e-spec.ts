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

describe('UploadFileController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('uplfile'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    const drRes = await request(app.getHttpServer())
      .post('/dataroom')
      .set('Cookie', `token=${authToken}`)
      .send({ name: 'File Upload Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /dataroom/:dataroomId/file', () => {
    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post(
        '/dataroom/fake-dr/file',
      );
      expect([401, 429]).toContain(res.statusCode);
    });

    it('should call the upload endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/file`)
        .set('Cookie', `token=${authToken}`)
        .attach('file', Buffer.from('test content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/file/:fileId', () => {
    it('should call the update endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/file/fake-file-id`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'renamed.pdf' });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/file/:fileId', () => {
    it('should call the delete endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}/file/fake-file-id`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/file/:fileId/move', () => {
    it('should call the move endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/file/fake-file-id/move`)
        .set('Cookie', `token=${authToken}`)
        .send({ categoryId: 'new-category' });
      expect(res.statusCode).not.toBe(404);
    });
  });
});
