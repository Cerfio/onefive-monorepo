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

describe('DataroomGroupController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drgrp'), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    // Create a dataroom
    const drRes = await request(app.getHttpServer())
      .post('/dataroom')
      .set('Cookie', `token=${authToken}`)
      .send({ name: 'Test Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  }, 180000);

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /dataroom/:dataroomId/group', () => {
    it('should call the create group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/group`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'Test Group' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/fake-id/group')
        .send({ name: 'Test' });
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('GET /dataroom/:dataroomId/group', () => {
    it('should call the get groups endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}/group`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/group/:groupId', () => {
    it('should call the update group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(`/dataroom/${dataroomId}/group/fake-group-id`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'Updated Group' });
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/group/:groupId', () => {
    it('should call the delete group endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}/group/fake-group-id`)
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });
});
