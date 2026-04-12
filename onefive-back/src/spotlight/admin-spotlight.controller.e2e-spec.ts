import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUniqueEmail,
  validPassword,
} from '../../test/helpers/fixtures';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AdminSpotlightController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  const validSpotBody = {
    spot: 'EVENT',
    name: 'Test Event',
    highlight: 'A test',
    address: '1 Rue de Paris',
    location: { lat: 48.8566, lng: 2.3522 },
    provider: 'ONEFIVE',
    url: 'https://example.com',
    description: 'Test event',
    event: {
      beginDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-02T00:00:00.000Z',
      expertiseDomains: ['TECH'],
      days: ['MONDAY'],
      uniqueId: `test-${Date.now()}`,
    },
  };

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  async function createAdminUser(prefix = 'admin') {
    const user = await createAuthenticatedUser(app, request, prefix);
    await prisma.profile.update({
      where: { id: user.profileId },
      data: { roles: ['ADMIN'] },
    });
    return user;
  }

  describe('POST /admin/spotlight', () => {
    it('should create a spot as admin → 201', async () => {
      const { token } = await createAdminUser('adm1');

      const res = await request(app.getHttpServer())
        .post('/admin/spotlight')
        .set('Cookie', `token=${token}`)
        .send({
          ...validSpotBody,
          event: {
            ...validSpotBody.event,
            uniqueId: `test-create-${Date.now()}`,
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createAuthenticatedUser(app, request, 'nonadm');

      const res = await request(app.getHttpServer())
        .post('/admin/spotlight')
        .set('Cookie', `token=${token}`)
        .send(validSpotBody);

      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/admin/spotlight')
        .send(validSpotBody)
        .expect(401);
    });
  });

  describe('PUT /admin/spotlight/:id', () => {
    it('should update a spot as admin → 200', async () => {
      const { token } = await createAdminUser('adm2');

      // Create a spot first
      const createRes = await request(app.getHttpServer())
        .post('/admin/spotlight')
        .set('Cookie', `token=${token}`)
        .send({
          ...validSpotBody,
          event: { ...validSpotBody.event, uniqueId: `test-upd-${Date.now()}` },
        })
        .expect(201);

      const spotId = createRes.body.data?.id;
      if (!spotId) {
        // If creation returned an error in the body, skip update assertion
        expect(createRes.body.success).toBe(true);
        return;
      }

      const res = await request(app.getHttpServer())
        .put(`/admin/spotlight/${spotId}`)
        .set('Cookie', `token=${token}`)
        .send({ name: 'Updated Event Name' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /admin/spotlight/:id', () => {
    it('should delete a spot as admin → 204', async () => {
      const { token } = await createAdminUser('adm3');

      // Create a spot first
      const createRes = await request(app.getHttpServer())
        .post('/admin/spotlight')
        .set('Cookie', `token=${token}`)
        .send({
          ...validSpotBody,
          event: { ...validSpotBody.event, uniqueId: `test-del-${Date.now()}` },
        })
        .expect(201);

      const spotId = createRes.body.data?.id;
      if (!spotId) {
        expect(createRes.body.success).toBe(true);
        return;
      }

      await request(app.getHttpServer())
        .delete(`/admin/spotlight/${spotId}`)
        .set('Cookie', `token=${token}`)
        .expect(204);
    });
  });
});
