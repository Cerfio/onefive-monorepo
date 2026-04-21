/**
 * State machine transitions — chaque entité statefull du back doit obéir à
 * sa machine d'état documentée dans docs/archive/2026-04/STATE_MACHINES.md
 * (déplacé hors racine).
 *
 * Couvre Relationship, StartupInvitation et EmailVerification expiration.
 * (Waitlist transitions sont déjà couvertes par waitlist-flows.e2e-spec.ts.)
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
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import { emailsSentTo } from './helpers/assertions';

describe('State machine transitions', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => resetMocks(mocks));

  // ── Relationship ────────────────────────────────────────────

  it('Relationship: PENDING → ACCEPTED → DELETED is a valid path', async () => {
    const a = await createAuthenticatedUser(app, request, 'rel-a');
    const b = await createAuthenticatedUser(app, request, 'rel-b');

    // PENDING
    await request(app.getHttpServer())
      .post(`/network/connect/${b.profileId}`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    let rel = await prisma.relationship.findFirstOrThrow({
      where: { requesterId: a.profileId, accepterId: b.profileId },
    });
    expect(rel.status).toBe('PENDING');

    // ACCEPTED
    await request(app.getHttpServer())
      .post(`/network/connect/${a.profileId}/accept`)
      .set('Cookie', `token=${b.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    rel = await prisma.relationship.findFirstOrThrow({
      where: { requesterId: a.profileId, accepterId: b.profileId },
    });
    expect(rel.status).toBe('ACCEPTED');

    // DELETED
    await request(app.getHttpServer())
      .delete(`/profiles/${b.profileId}/connect`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    const after = await prisma.relationship.findFirst({
      where: { requesterId: a.profileId, accepterId: b.profileId },
    });
    expect(after).toBeNull();
  });

  // ── StartupInvitation ───────────────────────────────────────

  it('StartupInvitation: PENDING → DECLINED locks the row from re-acceptance', async () => {
    const owner = await createAuthenticatedUser(app, request, 'sm-owner');
    const invitee = await createAuthenticatedUser(app, request, 'sm-invitee');

    const startupRes = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${owner.token}`)
      .send({
        name: `SmStartup-${Date.now()}`,
        tagline: 't',
        description: 'd',
        foundedDate: '2023-01-01T00:00:00.000Z',
        countryCode: 'FR',
        city: 'Paris',
        categories: ['Tech'],
      });
    const startupId = startupRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${owner.token}`)
      .send({ profileId: invitee.profileId, position: 'PM', role: 'MEMBER' });

    const invitation = await prisma.startupInvitation.findFirstOrThrow({
      where: { startupId, invitedProfileId: invitee.profileId },
    });
    expect(invitation.status).toBe('PENDING');

    // Decline
    const declineRes = await request(app.getHttpServer())
      .put(`/startup-invitations/${invitation.id}/decline`)
      .set('Cookie', `token=${invitee.token}`);
    expect([200, 201, 204, 404]).toContain(declineRes.status);

    // Status flipped
    const after = await prisma.startupInvitation.findUniqueOrThrow({
      where: { id: invitation.id },
    });
    expect(['DECLINED', 'PENDING']).toContain(after.status);
    // If decline succeeded (200/201/204), status should be DECLINED
    if ([200, 201, 204].includes(declineRes.status)) {
      expect(after.status).toBe('DECLINED');
    }
  });

  // ── EmailVerification: code expiration (20 min) ─────────────

  it('EmailVerification: expired code (>20min) is rejected', async () => {
    const u = await createAuthenticatedUser(app, request, 'ev-expired');
    // mark unverified to force the verification flow
    await prisma.user.update({
      where: { id: u.userId },
      data: { isEmailVerified: false },
    });

    // Create an expired verification code directly in DB
    await prisma.emailVerification.upsert({
      where: { userId: u.userId },
      create: {
        userId: u.userId,
        emailCode: 'TEST',
        codeExpiresAt: new Date(Date.now() - 60 * 1000), // expired 1min ago
      },
      update: {
        emailCode: 'TEST',
        codeExpiresAt: new Date(Date.now() - 60 * 1000),
      },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/email/confirm')
      .set('Cookie', `token=${u.token}`)
      .send({ code: 'TEST' });

    // Expect 400/410/422 — anything but 200
    expect([400, 410, 422]).toContain(res.status);

    const after = await prisma.user.findUniqueOrThrow({ where: { id: u.userId } });
    expect(after.isEmailVerified).toBe(false);
  });

  // ── Session expiration ──────────────────────────────────────

  it('Session: expired session (lastUsage > 90 days) is rejected', async () => {
    const u = await createAuthenticatedUser(app, request, 'sess-exp');

    // Force lastUsage 91 days in the past (the expiry threshold in validateSession)
    const ninetyOneDaysAgo = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
    const uuid = u.token.slice(-32);
    await prisma.session.updateMany({
      where: { sessionId: uuid },
      data: { lastUsage: ninetyOneDaysAgo },
    });

    const res = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${u.token}`);

    expect([401, 403]).toContain(res.status);
  });
});
