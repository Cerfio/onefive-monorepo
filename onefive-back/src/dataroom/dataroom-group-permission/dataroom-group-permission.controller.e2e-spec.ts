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

describe('DataroomGroupPermissionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('drperm'), password: validPassword })
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

  describe('PUT /dataroom/:dataroomId/group/:groupId/permissions', () => {
    it('should call the update permissions endpoint', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/fake-dr/group/fake-grp/permissions')
        .set('Cookie', `token=${authToken}`)
        .send({ permissions: [] });
      expect(res.statusCode).not.toBe(404);
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .put('/dataroom/fake-dr/group/fake-grp/permissions')
        .send({});
      expect([401, 429]).toContain(res.statusCode);
    });
  });
});
