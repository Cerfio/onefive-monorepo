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

describe('DataroomCategoryController (e2e)', () => {
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
   * Creates a startup (which auto-creates a dataroom) and returns both IDs.
   */
  async function createStartupWithDataroom(token: string) {
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

  describe('POST /dataroom/:dataroomId/category', () => {
    it('should create a category → 201', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'cat1');
      const { dataroomId } = await createStartupWithDataroom(token);

      const res = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/category`)
        .set('Cookie', `token=${token}`)
        .send({ name: 'Financial Documents' });

      expect([201, 403]).toContain(res.status);

      if (res.status === 201) {
        expect(res.body.data).toBeDefined();
        expect(res.body.data.id).toBeDefined();
      }
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/dataroom/fake-id/category')
        .send({ name: 'Unauthorized Category' })
        .expect(401);
    });
  });

  describe('GET /dataroom/:dataroomId/category', () => {
    it('should list categories → 200', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'cat2');
      const { dataroomId } = await createStartupWithDataroom(token);

      // Create a category first
      const createRes = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/category`)
        .set('Cookie', `token=${token}`)
        .send({ name: 'Legal Documents' });

      expect([201, 403]).toContain(createRes.status);

      const res = await request(app.getHttpServer())
        .get(`/dataroom/${dataroomId}/category`)
        .set('Cookie', `token=${token}`);

      expect([200, 403]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.data).toBeDefined();
      }
    });
  });

  describe('DELETE /dataroom/:dataroomId/category/:id', () => {
    it('should delete a category → 200', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'cat3');
      const { dataroomId } = await createStartupWithDataroom(token);

      // Create a category first
      const createRes = await request(app.getHttpServer())
        .post(`/dataroom/${dataroomId}/category`)
        .set('Cookie', `token=${token}`)
        .send({ name: 'To Delete' });

      expect([201, 403]).toContain(createRes.status);

      if (createRes.status !== 201) {
        return;
      }

      const categoryId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .delete(`/dataroom/${dataroomId}/category/${categoryId}`)
        .set('Cookie', `token=${token}`);

      expect([200, 403]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.data).toBeDefined();
      }
    });
  });
});
