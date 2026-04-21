/**
 * Dataroom CRUD complet — categories + groups + lifecycle.
 * IDOR déjà couvert par dataroom-idor-regression.e2e-spec.ts.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { createDataroomForUser } from './helpers/flow-helpers';
import { installMocks } from './helpers/mocks';

describe('Dataroom CRUD complet — categories + groups', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('Category CRUD: create + list + delete', async () => {
    const owner = await createAuthenticatedUser(app, request, 'cat-owner');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    // Create
    const createRes = await request(app.getHttpServer())
      .post(`/dataroom/${dataroomId}/category`)
      .set('Cookie', `token=${owner.token}`)
      .send({ name: `cat-${Date.now()}` })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    const categoryId = createRes.body.data?.id;
    expect(categoryId).toBeTruthy();

    // List (don't assume shape — verify via DB instead)
    await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}/category`)
      .set('Cookie', `token=${owner.token}`)
      .expect(200);
    const inDb = await prisma.category.findUnique({ where: { id: categoryId } });
    expect(inDb).toBeTruthy();

    // Delete
    await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}/category/${categoryId}`)
      .set('Cookie', `token=${owner.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });

  it('Group CRUD: create as owner, member can\'t (DataroomOwnerGuard)', async () => {
    const owner = await createAuthenticatedUser(app, request, 'grp-owner');
    const intruder = await createAuthenticatedUser(app, request, 'grp-intruder');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    // Create a non-admin group, then add intruder to it as a member
    const memberGroup = await prisma.dataroomGroup.create({
      data: {
        name: 'Read Only',
        type: 'CUSTOM',
        dataroomId,
        createdBy: owner.profileId,
        hasAllAccess: false,
        canUpload: false,
        canShare: false,
        canManageUsers: false,
        canManageGroups: false,
      },
    });
    await prisma.member.create({
      data: {
        dataroomId,
        profileId: intruder.profileId,
        groupId: memberGroup.id,
      },
    });

    // Owner CAN create a new group
    const okRes = await request(app.getHttpServer())
      .post(`/dataroom/${dataroomId}/group`)
      .set('Cookie', `token=${owner.token}`)
      .send({
        name: 'Investors',
        hasAllAccess: false,
        canUpload: false,
        canShare: false,
        canManageUsers: false,
        canManageGroups: false,
      });
    expect([200, 201]).toContain(okRes.status);

    // Intruder (non-admin member) CANNOT
    const blockedRes = await request(app.getHttpServer())
      .post(`/dataroom/${dataroomId}/group`)
      .set('Cookie', `token=${intruder.token}`)
      .send({
        name: 'PWN',
        hasAllAccess: true,
        canUpload: true,
        canShare: true,
        canManageUsers: true,
        canManageGroups: true,
      });
    expect(blockedRes.status).toBe(403);
  });

  it('Owner can DELETE the dataroom; non-owner cannot', async () => {
    const owner = await createAuthenticatedUser(app, request, 'dr-del-o');
    const outsider = await createAuthenticatedUser(app, request, 'dr-del-out');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    // Outsider blocked
    const ko = await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${outsider.token}`);
    expect(ko.status).toBe(403);

    // Owner OK
    await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${owner.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });

  it('GET /dataroom (list of accessible datarooms) returns owner\'s datarooms', async () => {
    const owner = await createAuthenticatedUser(app, request, 'dr-list-o');
    await createDataroomForUser(app, request, owner, { prisma });

    const res = await request(app.getHttpServer())
      .get('/dataroom')
      .set('Cookie', `token=${owner.token}`)
      .expect(200);

    const items: any[] = res.body.data?.items ?? res.body.data ?? [];
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
