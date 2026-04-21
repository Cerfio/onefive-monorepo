/**
 * Tests pour les 5 types de NotificationType jamais couverts :
 * INVESTOR_INVITATION, MENTION, SYSTEM_ANNOUNCEMENT, DATAROOM_ENGAGEMENT, DATAROOM_UPDATE.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationHelperService } from '../src/notification/notification-helper.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';
import { notificationsFor } from './helpers/assertions';

describe('Notification types — remaining 5', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: NotificationHelperService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    helper = app.get(NotificationHelperService);
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('INVESTOR_INVITATION: créée avec startupId + message custom', async () => {
    const inviter = await createAuthenticatedUser(app, request, 'inv-inviter');
    const invitee = await createAuthenticatedUser(app, request, 'inv-invitee');

    await helper.notifyInvestorInvitation({
      invitedProfileId: invitee.profileId,
      inviterProfileId: inviter.profileId,
      inviterName: 'Startup Founder',
      startupId: 'fake-startup-id',
      startupName: 'MockStartup',
      investorRecordId: 'fake-record-id',
    });

    const notifs = await notificationsFor(prisma, invitee.profileId, 'INVESTOR_INVITATION');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].entityId).toBe('fake-startup-id');
    expect(notifs[0].entityType).toBe('STARTUP');
    expect((notifs[0].data as any).investorRecordId).toBe('fake-record-id');
  });

  it('MENTION in POST: créée avec entityType=POST', async () => {
    const actor = await createAuthenticatedUser(app, request, 'mention-actor');
    const mentioned = await createAuthenticatedUser(app, request, 'mention-target');

    await helper.notifyMention({
      mentionedProfileId: mentioned.profileId,
      actorProfileId: actor.profileId,
      actorName: 'Alice',
      entityId: 'fake-post-id',
      entityType: 'POST',
      context: 'Check this out',
    });

    const notifs = await notificationsFor(prisma, mentioned.profileId, 'MENTION');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].entityType).toBe('POST');
    expect(notifs[0].message).toMatch(/publication/);
  });

  it('MENTION self → no notification', async () => {
    const u = await createAuthenticatedUser(app, request, 'mention-self');
    const r = await helper.notifyMention({
      mentionedProfileId: u.profileId,
      actorProfileId: u.profileId,
      actorName: 'Me',
      entityId: 'fake-id',
      entityType: 'POST',
    });
    expect(r).toBeNull();
  });

  it('SYSTEM_ANNOUNCEMENT: créée avec title + message custom', async () => {
    const u = await createAuthenticatedUser(app, request, 'sys-target');
    await helper.notifySystem({
      profileId: u.profileId,
      title: 'Maintenance',
      message: 'The service will be down on Sunday 2am-3am UTC.',
      entityType: 'SYSTEM',
    });

    const notifs = await notificationsFor(prisma, u.profileId, 'SYSTEM_ANNOUNCEMENT');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toBe('Maintenance');
    expect(notifs[0].message).toMatch(/Sunday/);
  });

  it('DATAROOM_ENGAGEMENT: first_view → message avec dataroom name', async () => {
    const owner = await createAuthenticatedUser(app, request, 'de-owner');
    const viewer = await createAuthenticatedUser(app, request, 'de-viewer');

    await helper.notifyDataroomEngagement({
      ownerProfileId: owner.profileId,
      dataroomId: 'fake-dr-id',
      dataroomName: 'Investor Pack 2026',
      engagementType: 'first_view',
      actorName: 'Investor A',
      actorProfileId: viewer.profileId,
    });

    const notifs = await notificationsFor(prisma, owner.profileId, 'DATAROOM_ENGAGEMENT');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].message).toMatch(/Investor Pack 2026/);
    expect(notifs[0].entityType).toBe('DATAROOM');
  });

  it('DATAROOM_ENGAGEMENT: owner viewing own dataroom → no notification', async () => {
    const owner = await createAuthenticatedUser(app, request, 'de-self');

    const r = await helper.notifyDataroomEngagement({
      ownerProfileId: owner.profileId,
      dataroomId: 'fake-id',
      dataroomName: 'My own room',
      engagementType: 'first_view',
      actorName: 'Me',
      actorProfileId: owner.profileId,
    });
    expect(r).toBeNull();
  });

  it('DATAROOM_UPDATE: document_added notification shape', async () => {
    const u = await createAuthenticatedUser(app, request, 'du-target');
    await helper.notifyDataroomUpdate({
      profileId: u.profileId,
      dataroomId: 'fake-dr-id',
      dataroomName: 'Seed Round Data',
      updateType: 'document_added',
      details: 'financials.pdf',
    });

    const notifs = await notificationsFor(prisma, u.profileId, 'DATAROOM_UPDATE');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toBe('Seed Round Data');
    expect(notifs[0].message).toMatch(/Nouveau document ajouté.*financials\.pdf/);
  });

  it('DATAROOM_ENGAGEMENT: high_time_spent with file name and minutes', async () => {
    const owner = await createAuthenticatedUser(app, request, 'de-time-owner');
    const viewer = await createAuthenticatedUser(app, request, 'de-time-viewer');

    await helper.notifyDataroomEngagement({
      ownerProfileId: owner.profileId,
      dataroomId: 'fake-dr',
      dataroomName: 'Pitch Room',
      engagementType: 'high_time_spent',
      actorName: 'VC Fund',
      actorProfileId: viewer.profileId,
      details: { fileName: 'pitch.pdf', timeSpent: 480 }, // 8 min
    });

    const notifs = await notificationsFor(prisma, owner.profileId, 'DATAROOM_ENGAGEMENT');
    expect(notifs[0].message).toMatch(/8 minutes/);
    expect(notifs[0].message).toMatch(/pitch\.pdf/);
  });
});
