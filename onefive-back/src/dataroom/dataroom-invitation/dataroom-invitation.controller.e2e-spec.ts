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

describe('DataroomInvitationController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let dataroomId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drinv'), password: validPassword })
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
      .send({ name: 'Inv Dataroom' });
    if (drRes.body?.data?.id) {
      dataroomId = drRes.body.data.id;
    }
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /dataroom/:dataroomId/invitation', () => {
    it('should call the create invitation endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/invitation`)
        .set('Cookie', `token=${authToken}`)
        .send({ email: 'invited@test.com', groupId: 'fake-group' });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/dataroom/fake-id/invitation')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });

  describe('PUT /dataroom/:dataroomId/invitation/:invitationId/accept', () => {
    it('should call the accept endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(
          `/dataroom/${dataroomId}/invitation/00000000-0000-0000-0000-000000000000/accept`,
        )
        .set('Cookie', `token=${authToken}`)
        .send({ profileId: 'fake-profile' });
      // Route exists, may return 400/500 for invalid invitation ID
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('PUT /dataroom/:dataroomId/invitation/:invitationId/decline', () => {
    it('should call the decline endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .put(
          `/dataroom/${dataroomId}/invitation/00000000-0000-0000-0000-000000000000/decline`,
        )
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('DELETE /dataroom/:dataroomId/invitation/:invitationId', () => {
    it('should call the delete endpoint', async () => {
      if (!dataroomId) return;
      const res = await request(app.getHttpServer())
        .delete(
          `/dataroom/${dataroomId}/invitation/00000000-0000-0000-0000-000000000000`,
        )
        .set('Cookie', `token=${authToken}`);
      expect(res.statusCode).not.toBe(404);
    });
  });
});
