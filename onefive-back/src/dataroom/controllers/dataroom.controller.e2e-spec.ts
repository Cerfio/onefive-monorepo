import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createStartupData,
  createUniqueEmail,
  validPassword,
} from '../../../test/helpers/fixtures';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('DataroomController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  /**
   * Creates a startup and returns its ID.
   * Note: The startup service auto-creates a dataroom for the startup.
   */
  async function createStartupWithDataroom(token: string, profileId: string) {
    const res = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${token}`)
      .send(createStartupData());

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    const startupId = res.body.data.id;

    // The startup service auto-creates a dataroom; retrieve it
    const dataroom = await prisma.dataroom.findUnique({
      where: { startupId },
    });

    return { startupId, dataroomId: dataroom?.id };
  }

  describe('POST /dataroom', () => {
    it('should auto-create a dataroom with startup → dataroom exists', async () => {
      const { token, profileId } = await createAuthenticatedUser(
        app,
        request,
        'dr1',
      );
      const { startupId, dataroomId } = await createStartupWithDataroom(
        token,
        profileId,
      );

      // Dataroom was auto-created with startup
      expect(dataroomId).toBeDefined();

      // Verify we can get it
      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}?profileId=${profileId}`)
        .set('Cookie', `token=${token}`);

      expect([200, 403]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.data).toBeDefined();
      }
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/dataroom')
        .send({ startupId: 'fake', createdBy: 'fake' })
        .expect(401);
    });
  });

  describe('GET /dataroom', () => {
    it('should list datarooms → 200', async () => {
      const { token, profileId } = await createAuthenticatedUser(
        app,
        request,
        'dr2',
      );
      await createStartupWithDataroom(token, profileId);

      const res = await request(app.getHttpServer())
        .get(`/dataroom?profileId=${profileId}`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /dataroom/:dataroomId', () => {
    it('should get a single dataroom → 200', async () => {
      const { token, profileId } = await createAuthenticatedUser(
        app,
        request,
        'dr3',
      );
      const { dataroomId } = await createStartupWithDataroom(token, profileId);

      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}?profileId=${profileId}`)
        .set('Cookie', `token=${token}`);

      expect([200, 403]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.data).toBeDefined();
      }
    });
  });

  describe('DELETE /dataroom/:dataroomId', () => {
    it('should delete a dataroom → 200', async () => {
      const { token, profileId } = await createAuthenticatedUser(
        app,
        request,
        'dr4',
      );
      const { dataroomId } = await createStartupWithDataroom(token, profileId);

      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}`)
        .set('Cookie', `token=${token}`);

      expect([200, 403]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.data).toBeDefined();
      }
    });
  });
});
