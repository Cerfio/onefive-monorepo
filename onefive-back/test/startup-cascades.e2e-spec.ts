/**
 * Startup cascades — création, ajout founder, invitation par email, equity
 * validation. Chaque action asserts les side-effects attendus (member créé,
 * notification envoyée, email, PostHog).
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser, createStartupData } from './helpers/fixtures';
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import {
  emailsSentTo,
  notificationsFor,
  posthogEventsFor,
  waitForNotifications,
} from './helpers/assertions';

describe('Startup cascades — create / add founder / invite member / transfer', () => {
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

  async function createStartup(token: string) {
    const res = await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${token}`)
      .send(createStartupData())
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Create startup failed: ${r.status} ${JSON.stringify(r.body)}`);
        }
      });
    return res.body.data.id as string;
  }

  it('create startup: creator becomes SUPER_ADMIN member + PostHog event', async () => {
    const founder = await createAuthenticatedUser(app, request, 'founder-main');
    const startupId = await createStartup(founder.token);

    const members = await prisma.startupMember.findMany({ where: { startupId } });
    expect(members).toHaveLength(1);
    expect(members[0].profileId).toBe(founder.profileId);
    expect(members[0].role).toBe('SUPER_ADMIN');

    expect(posthogEventsFor(mocks, 'startup_created')).toHaveLength(1);
  });

  it('add existing profile as non-founder: StartupInvitation (PENDING) created, invitee remains non-member until accepted', async () => {
    const owner = await createAuthenticatedUser(app, request, 'owner-af');
    const invitee = await createAuthenticatedUser(app, request, 'member-af');
    const startupId = await createStartup(owner.token);

    resetMocks(mocks);

    await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${owner.token}`)
      .send({
        profileId: invitee.profileId,
        position: 'Engineer',
        isFounder: false,
        role: 'MEMBER',
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Add member failed: ${r.status} ${JSON.stringify(r.body)}`);
        }
      });

    // Invitee is NOT yet a member — only the owner is
    const members = await prisma.startupMember.findMany({ where: { startupId } });
    expect(members).toHaveLength(1);
    expect(members[0].profileId).toBe(owner.profileId);

    // A PENDING StartupInvitation was created instead
    const invitation = await prisma.startupInvitation.findFirst({
      where: { startupId, invitedProfileId: invitee.profileId },
    });
    expect(invitation).toBeTruthy();
    expect(invitation!.status).toBe('PENDING');
  });

  it('equity validation: adding a 2nd founder is rejected because creator already owns 100% equity', async () => {
    const owner = await createAuthenticatedUser(app, request, 'equity-owner');
    const co1 = await createAuthenticatedUser(app, request, 'equity-co1');
    const startupId = await createStartup(owner.token);

    // Default founder at startup creation has 100% equity. Adding another
    // founder with any equity must fail.
    const res = await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${owner.token}`)
      .send({ profileId: co1.profileId, position: 'CTO', isFounder: true, equity: 40 });

    expect([400, 409, 422]).toContain(res.status);
    expect(JSON.stringify(res.body)).toMatch(/equity/i);

    const members = await prisma.startupMember.findMany({ where: { startupId } });
    expect(members.filter((m) => m.profileId === co1.profileId)).toHaveLength(0);
  });

  it('invite member by email (new user): creates StartupInvitation + sends email', async () => {
    const owner = await createAuthenticatedUser(app, request, 'invite-owner');
    const startupId = await createStartup(owner.token);

    const newEmail = `new-member-${Date.now()}@example.com`;

    resetMocks(mocks);

    // Single /members endpoint handles both existing (profileId) and new (email)
    await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${owner.token}`)
      .send({
        email: newEmail,
        firstName: 'New',
        lastName: 'Member',
        position: 'Engineer',
        role: 'MEMBER',
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Invite failed: ${r.status} ${JSON.stringify(r.body)}`);
        }
      });

    const invitation = await prisma.startupInvitation.findFirst({
      where: { startupId, email: newEmail.toLowerCase() },
    });
    expect(invitation).toBeTruthy();
    expect(invitation!.status).toBe('PENDING');

    const invites = emailsSentTo(mocks, newEmail);
    expect(invites.length).toBeGreaterThan(0);
  });

  it('invite existing profile as member: creates StartupInvitation + sends STARTUP_INVITATION notif', async () => {
    const owner = await createAuthenticatedUser(app, request, 'inv-ex-owner');
    const invitee = await createAuthenticatedUser(app, request, 'inv-ex-invitee');
    const startupId = await createStartup(owner.token);

    resetMocks(mocks);

    await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${owner.token}`)
      .send({
        profileId: invitee.profileId,
        position: 'Designer',
        role: 'MEMBER',
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Invite failed: ${r.status} ${JSON.stringify(r.body)}`);
        }
      });

    // Notification can be async — poll
    const notifs = await waitForNotifications(
      prisma,
      invitee.profileId,
      'STARTUP_INVITATION',
      1,
    );
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('outsider cannot add member to someone else startup (403)', async () => {
    const owner = await createAuthenticatedUser(app, request, 'sec-owner');
    const outsider = await createAuthenticatedUser(app, request, 'sec-outsider');
    const victim = await createAuthenticatedUser(app, request, 'sec-victim');
    const startupId = await createStartup(owner.token);

    const res = await request(app.getHttpServer())
      .post(`/startup/${startupId}/members`)
      .set('Cookie', `token=${outsider.token}`)
      .send({ profileId: victim.profileId, position: 'Whatever', isFounder: false, role: 'MEMBER' });

    expect([400, 403, 404]).toContain(res.status);
  });
});
