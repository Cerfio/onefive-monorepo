/**
 * Notifications agrégées (LinkedIn-style) — quand N personnes font la même
 * action sur la même cible dans une fenêtre 24h, on n'envoie pas N notifs
 * mais UNE notif dont le message est mis à jour ("X et N autres personnes...").
 *
 * Couvre PROFILE_VIEW (nouvelle implémentation) et FOLLOW (existant).
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
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import { notificationsFor } from './helpers/assertions';

describe('Notification aggregation (24h window)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: NotificationHelperService;
  let mocks: ExternalCallMocks;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    helper = app.get(NotificationHelperService);
    mocks = installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => resetMocks(mocks));

  it('PROFILE_VIEW: 20 distinct viewers in 24h → 1 aggregated notification, count=20', async () => {
    const target = await createAuthenticatedUser(app, request, 'pv-target');

    // Create 20 distinct viewers and trigger notifyProfileView for each
    for (let i = 0; i < 20; i++) {
      const viewer = await createAuthenticatedUser(app, request, `viewer${i}`);
      await helper.notifyProfileView({
        viewedProfileId: target.profileId,
        viewerProfileId: viewer.profileId,
        viewerName: `Viewer ${i}`,
      });
    }

    const notifs = await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW');
    expect(notifs).toHaveLength(1);

    const data = notifs[0].data as any;
    expect(data.aggregated).toBe(true);
    expect(data.count).toBe(20);
    expect(data.viewers).toHaveLength(20);

    // Message should mention "X et 19 autres personnes"
    expect(notifs[0].message).toMatch(/19 autres personnes/);
  });

  it('PROFILE_VIEW: same viewer twice → idempotent, count stays 1', async () => {
    const target = await createAuthenticatedUser(app, request, 'pv-idem-target');
    const viewer = await createAuthenticatedUser(app, request, 'pv-idem-viewer');

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: viewer.profileId,
      viewerName: 'Solo Viewer',
    });

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: viewer.profileId,
      viewerName: 'Solo Viewer',
    });

    const notifs = await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW');
    expect(notifs).toHaveLength(1);
    const data = notifs[0].data as any;
    expect(data.count).toBe(1);
  });

  it('PROFILE_VIEW: progresses through cardinalities — single → pair → trio → many', async () => {
    const target = await createAuthenticatedUser(app, request, 'pv-prog');
    const v1 = await createAuthenticatedUser(app, request, 'prog-v1');
    const v2 = await createAuthenticatedUser(app, request, 'prog-v2');
    const v3 = await createAuthenticatedUser(app, request, 'prog-v3');
    const v4 = await createAuthenticatedUser(app, request, 'prog-v4');

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v1.profileId,
      viewerName: 'Alice',
    });
    let notif = (await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW'))[0];
    expect(notif.message).toBe('a consulté votre profil');

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v2.profileId,
      viewerName: 'Bob',
    });
    notif = (await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW'))[0];
    expect(notif.message).toMatch(/Bob ont consulté/);

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v3.profileId,
      viewerName: 'Carol',
    });
    notif = (await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW'))[0];
    expect(notif.message).toMatch(/Bob et Carol ont consulté/);

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v4.profileId,
      viewerName: 'Dan',
    });
    notif = (await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW'))[0];
    expect(notif.message).toMatch(/3 autres personnes ont consulté/);
  });

  it('PROFILE_VIEW: self-view never creates a notification', async () => {
    const u = await createAuthenticatedUser(app, request, 'pv-self');
    await helper.notifyProfileView({
      viewedProfileId: u.profileId,
      viewerProfileId: u.profileId,
      viewerName: 'me',
    });
    const notifs = await notificationsFor(prisma, u.profileId, 'PROFILE_VIEW');
    expect(notifs).toHaveLength(0);
  });

  it('PROFILE_VIEW: once read, the next viewer creates a NEW notification (not aggregated to read one)', async () => {
    const target = await createAuthenticatedUser(app, request, 'pv-read');
    const v1 = await createAuthenticatedUser(app, request, 'pv-read-v1');
    const v2 = await createAuthenticatedUser(app, request, 'pv-read-v2');

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v1.profileId,
      viewerName: 'V1',
    });
    // Mark as read
    await prisma.notification.updateMany({
      where: { profileId: target.profileId, type: 'PROFILE_VIEW' },
      data: { read: true },
    });

    await helper.notifyProfileView({
      viewedProfileId: target.profileId,
      viewerProfileId: v2.profileId,
      viewerName: 'V2',
    });

    const notifs = await notificationsFor(prisma, target.profileId, 'PROFILE_VIEW');
    expect(notifs).toHaveLength(2);
    // Newer one should have count=1 (fresh batch)
    const newer = notifs.find((n) => !n.read);
    expect((newer!.data as any).count).toBe(1);
  });

  it('FOLLOW: 20 distinct followers in 24h → 1 aggregated notification, count=20', async () => {
    const target = await createAuthenticatedUser(app, request, 'fol-target');

    for (let i = 0; i < 20; i++) {
      const follower = await createAuthenticatedUser(app, request, `follower${i}`);
      await helper.notifyFollow({
        followedProfileId: target.profileId,
        followerProfileId: follower.profileId,
        followerName: `Follower ${i}`,
      });
    }

    const notifs = await notificationsFor(prisma, target.profileId, 'FOLLOW');
    expect(notifs).toHaveLength(1);
    expect((notifs[0].data as any).count).toBe(20);
    expect(notifs[0].message).toMatch(/19 autres personnes vous suivent/);
  });
});
