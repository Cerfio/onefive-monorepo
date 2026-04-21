/**
 * Network cascades — follow (avec agrégation 24h LinkedIn-style) + connection
 * request + acceptance. Le follow est le cas le plus subtil : 2 follows dans
 * la même fenêtre 24h doivent agréger dans UNE notif (pas créer une 2e).
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
import { notificationsFor, posthogEventsFor } from './helpers/assertions';

describe('Network cascades — follow / connection', () => {
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

  beforeEach(() => {
    resetMocks(mocks);
  });

  it('follow cascade: A follows B → FOLLOW notification created', async () => {
    const a = await createAuthenticatedUser(app, request, 'follower1');
    const b = await createAuthenticatedUser(app, request, 'followed1');

    await request(app.getHttpServer())
      .post(`/profiles/${b.profileId}/follow`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });

    const notifs = await notificationsFor(prisma, b.profileId, 'FOLLOW');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].actorId).toBe(a.profileId);

    expect(posthogEventsFor(mocks, 'profile_followed')).toHaveLength(1);
  });

  it('follow aggregation (24h): 2 different followers in window → single FOLLOW notif updated', async () => {
    const target = await createAuthenticatedUser(app, request, 'aggtarget');
    const f1 = await createAuthenticatedUser(app, request, 'aggf1');
    const f2 = await createAuthenticatedUser(app, request, 'aggf2');

    // First follow creates one notif (unread)
    await request(app.getHttpServer())
      .post(`/profiles/${target.profileId}/follow`)
      .set('Cookie', `token=${f1.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    let notifs = await notificationsFor(prisma, target.profileId, 'FOLLOW');
    expect(notifs).toHaveLength(1);
    const firstNotifId = notifs[0].id;

    // Second follower within 24h — must NOT create a second row, but update the existing one
    await request(app.getHttpServer())
      .post(`/profiles/${target.profileId}/follow`)
      .set('Cookie', `token=${f2.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    notifs = await notificationsFor(prisma, target.profileId, 'FOLLOW');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].id).toBe(firstNotifId); // same row, updated
  });

  it('unfollow is silent: A unfollows B → no new notif, existing one stays', async () => {
    const a = await createAuthenticatedUser(app, request, 'unfol_a');
    const b = await createAuthenticatedUser(app, request, 'unfol_b');

    await request(app.getHttpServer())
      .post(`/profiles/${b.profileId}/follow`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const before = await notificationsFor(prisma, b.profileId);
    const beforeCount = before.length;

    await request(app.getHttpServer())
      .delete(`/profiles/${b.profileId}/follow`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const after = await notificationsFor(prisma, b.profileId);
    expect(after.length).toBe(beforeCount);
  });

  it('connection request cascade (network route): A sends connection → B receives CONNECTION_REQUEST notif', async () => {
    const a = await createAuthenticatedUser(app, request, 'conn_a');
    const b = await createAuthenticatedUser(app, request, 'conn_b');

    // NOTE: le frontend utilise /network/connect/:profileId (et PAS
    // /profiles/:profileId/connect qui existe aussi mais ne déclenche pas la
    // notification — route zombie à nettoyer plus tard).
    await request(app.getHttpServer())
      .post(`/network/connect/${b.profileId}`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });

    const notifs = await notificationsFor(prisma, b.profileId, 'CONNECTION_REQUEST');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].actorId).toBe(a.profileId);

    // Relationship row exists in PENDING
    const rel = await prisma.relationship.findFirst({
      where: { requesterId: a.profileId, accepterId: b.profileId },
    });
    expect(rel?.status).toBe('PENDING');
  });

  it('accept connection cascade (network route): B accepts → relationship becomes ACCEPTED', async () => {
    const a = await createAuthenticatedUser(app, request, 'accept_a');
    const b = await createAuthenticatedUser(app, request, 'accept_b');

    await request(app.getHttpServer())
      .post(`/network/connect/${b.profileId}`)
      .set('Cookie', `token=${a.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    // B accepts (note: accept route uses the REQUESTER profile id as the :profileId param)
    await request(app.getHttpServer())
      .post(`/network/connect/${a.profileId}/accept`)
      .set('Cookie', `token=${b.token}`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const rel = await prisma.relationship.findFirst({
      where: { requesterId: a.profileId, accepterId: b.profileId },
    });
    expect(rel?.status).toBe('ACCEPTED');
  });

  it('no self-connection: A connects to self → 400 + no relationship + no notif', async () => {
    const a = await createAuthenticatedUser(app, request, 'selfconn');

    const res = await request(app.getHttpServer())
      .post(`/network/connect/${a.profileId}`)
      .set('Cookie', `token=${a.token}`);

    expect(res.status).toBe(400);

    const selfRels = await prisma.relationship.findMany({
      where: { requesterId: a.profileId, accepterId: a.profileId },
    });
    expect(selfRels).toHaveLength(0);

    const notifs = await notificationsFor(prisma, a.profileId, 'CONNECTION_REQUEST');
    expect(notifs).toHaveLength(0);
  });

  it('no external emails on follow/connection (defence-in-depth)', async () => {
    const a = await createAuthenticatedUser(app, request, 'no_ext_a');
    const b = await createAuthenticatedUser(app, request, 'no_ext_b');

    resetMocks(mocks); // ignore signup transactional side effects

    await request(app.getHttpServer())
      .post(`/profiles/${b.profileId}/follow`)
      .set('Cookie', `token=${a.token}`);

    await request(app.getHttpServer())
      .post(`/network/connect/${b.profileId}`)
      .set('Cookie', `token=${a.token}`);

    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.sms).not.toHaveBeenCalled();
  });
});
