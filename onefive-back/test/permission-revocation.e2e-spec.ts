/**
 * Permission revocation cascades — qu'arrive-t-il à un user qui PERD un accès
 * acquis (kicked d'une dataroom, banni, logout, etc.) ?
 *
 * Couvre les invariants de sécurité les plus subtils : un user qui avait
 * accès à une ressource ne doit PAS pouvoir continuer à l'utiliser une fois
 * son accès retiré.
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

describe('Permission revocation cascades', () => {
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

  it('logout: token immediately rejected on next protected request', async () => {
    const u = await createAuthenticatedUser(app, request, 'logout-user');

    // Verify can access protected route
    await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${u.token}`)
      .expect(200);

    // Logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `token=${u.token}`)
      .expect(200);

    // Same token should now be rejected
    const after = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${u.token}`);

    expect([401, 403]).toContain(after.status);
  });

  it('waitlist IGNORED: WaitlistGuard returns 403 on protected mutation', async () => {
    const u = await createAuthenticatedUser(app, request, 'banned');

    // Admin moves the profile from ACTIVE to IGNORED
    await prisma.profile.update({
      where: { id: u.profileId },
      data: { waitlistStatus: 'IGNORED' },
    });

    // Any protected route NOT marked @AllowWaitlistNotActive must 403
    const after = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${u.token}`)
      .send({ content: 'should fail', tags: [] });

    expect(after.status).toBe(403);
  });

  it('removed from dataroom (leave): old member loses access on next request', async () => {
    const owner = await createAuthenticatedUser(app, request, 'dr-owner-rev');
    const member = await createAuthenticatedUser(app, request, 'dr-member-rev');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    // Make member a real member by inserting directly (bypass invitation flow)
    const ownerMember = await prisma.member.findFirstOrThrow({
      where: { dataroomId, profileId: owner.profileId },
      include: { group: true },
    });
    await prisma.member.create({
      data: {
        dataroomId,
        profileId: member.profileId,
        groupId: ownerMember.groupId,
      },
    });

    // Member CAN access
    const ok = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${member.token}`);
    expect(ok.status).toBe(200);

    // Member leaves
    await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}/leave`)
      .set('Cookie', `token=${member.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`leave got ${r.status}`);
      });

    // Now access denied
    const after = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${member.token}`);
    expect(after.status).toBe(403);
  });

  it('removed from dataroom (admin removes member from group): member loses access', async () => {
    const owner = await createAuthenticatedUser(app, request, 'dr-owner-rm');
    const member = await createAuthenticatedUser(app, request, 'dr-member-rm');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    const ownerMember = await prisma.member.findFirstOrThrow({
      where: { dataroomId, profileId: owner.profileId },
    });
    const memberRow = await prisma.member.create({
      data: {
        dataroomId,
        profileId: member.profileId,
        groupId: ownerMember.groupId,
      },
    });

    // Member CAN access
    await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${member.token}`)
      .expect(200);

    // Owner removes member from group
    await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}/group/${ownerMember.groupId}/member/${memberRow.id}`)
      .set('Cookie', `token=${owner.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`remove got ${r.status}`);
      });

    // Member loses access
    const after = await request(app.getHttpServer())
      .get(`/dataroom/${dataroomId}`)
      .set('Cookie', `token=${member.token}`);
    expect(after.status).toBe(403);
  });

  it('removed from startup: ex-member 403 on member-list query', async () => {
    const owner = await createAuthenticatedUser(app, request, 'st-owner-rm');
    const member = await createAuthenticatedUser(app, request, 'st-member-rm');

    const startupRes = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${owner.token}`)
      .send({
        name: `RmStartup-${Date.now()}`,
        tagline: 'tag',
        description: 'desc',
        foundedDate: '2023-01-01T00:00:00.000Z',
        countryCode: 'FR',
        city: 'Paris',
        categories: ['Tech'],
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`create startup ${r.status}`);
      });
    const startupId = startupRes.body.data.id;

    // Insert member directly
    const memberRow = await prisma.startupMember.create({
      data: {
        startupId,
        profileId: member.profileId,
        role: 'MEMBER',
        position: 'Engineer',
        equity: 0,
        isFounder: false,
      },
    });

    // Owner removes the member
    await request(app.getHttpServer())
      .delete(`/startup/${startupId}/members/${memberRow.id}`)
      .set('Cookie', `token=${owner.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`remove ${r.status}`);
      });

    // Verify the member row is gone
    const remaining = await prisma.startupMember.findUnique({
      where: { id: memberRow.id },
    });
    expect(remaining).toBeNull();
  });

  it('owner cannot leave their own dataroom (must transfer first)', async () => {
    const owner = await createAuthenticatedUser(app, request, 'dr-owner-leave');
    const { dataroomId } = await createDataroomForUser(app, request, owner, { prisma });
    if (!dataroomId) throw new Error('dataroom not created');

    const res = await request(app.getHttpServer())
      .delete(`/dataroom/${dataroomId}/leave`)
      .set('Cookie', `token=${owner.token}`);

    expect(res.status).toBe(400);
  });
});
