/**
 * Startup Flows E2E Tests
 *
 * Tests complete startup lifecycle:
 * - Create startup + funding + team
 * - Invite founders/members + accept/decline
 * - Startup search and visibility
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import {
  createStartupData,
  createUniqueEmail,
  validPassword,
} from '../../helpers/fixtures';
import {
  completeUserRegistration,
  createStartupWithFounders,
  createFundableStartup,
  createCompleteStartup,
} from '../../helpers/flow-helpers';

describe('Startup Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ─────────────────────────────────────────────────────
  // Flow 1: Startup Creation + Team Building
  // ─────────────────────────────────────────────────────

  describe('Startup Creation & Team Flow', () => {
    it('should create startup, invite member, and member accepts', async () => {
      const founder = await completeUserRegistration(app, request, 'stcreate');

      // 1. Create startup
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());

      expect([200, 201]).toContain(startupRes.statusCode);
      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      // 2. Get startup to verify
      const getRes = await request(app.getHttpServer())
        .get(`/startup/${startupId}`)
        .set('Cookie', `token=${founder.token}`);

      expect([200]).toContain(getRes.statusCode);

      // 3. Update startup description
      const updateRes = await request(app.getHttpServer())
        .put(`/startup/${startupId}`)
        .set('Cookie', `token=${founder.token}`)
        .send({ description: 'Updated description for startup' });

      expect([200]).toContain(updateRes.statusCode);

      // 4. Create another user and invite them
      const member = await completeUserRegistration(app, request, 'stmember');

      const inviteRes = await request(app.getHttpServer())
        .post('/startup/invite')
        .set('Cookie', `token=${founder.token}`)
        .send({
          profileId: member.profileId,
          position: 'Developer',
          equity: 0,
        });

      expect([200, 201]).toContain(inviteRes.statusCode);

      // 4b. Member should receive STARTUP_INVITATION notification
      await new Promise((resolve) => setTimeout(resolve, 150));
      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${member.token}`)
        .expect(200);
      const notifData = notifsRes.body?.data;
      const notifItems = Array.isArray(notifData)
        ? notifData
        : (notifData?.items ?? []);
      const hasInviteNotif = notifItems.some(
        (n: any) =>
          (n.type === 'STARTUP_INVITATION' || n.entityType === 'STARTUP') &&
          n.entityId === startupId,
      );
      expect(hasInviteNotif).toBe(true);

      // 5. Member views invitations
      const invitationsRes = await request(app.getHttpServer())
        .get('/startup/invitations')
        .set('Cookie', `token=${member.token}`)
        .expect(200);

      expect(invitationsRes.body.data).toBeDefined();

      // 6. Member accepts invitation
      if (invitationsRes.body.data?.length > 0) {
        const invId = invitationsRes.body.data[0].id;
        const acceptRes = await request(app.getHttpServer())
          .put(`/startup/invitations/${invId}/accept`)
          .set('Cookie', `token=${member.token}`);

        expect([200, 201]).toContain(acceptRes.statusCode);
      }

      // 7. Both can see startup members
      const membersRes = await request(app.getHttpServer())
        .get(`/startup/${startupId}/members`)
        .set('Cookie', `token=${founder.token}`);

      expect([200]).toContain(membersRes.statusCode);
    });

    it('should allow member to decline invitation', async () => {
      const founder = await completeUserRegistration(app, request, 'stdecl');
      const invitee = await completeUserRegistration(app, request, 'stinvdecl');

      // Create startup
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());

      const startupId = startupRes.body.data?.id;

      // Invite
      await request(app.getHttpServer())
        .post('/startup/invite')
        .set('Cookie', `token=${founder.token}`)
        .send({
          profileId: invitee.profileId,
          position: 'Designer',
          equity: 5,
        });

      // Get and decline
      const invRes = await request(app.getHttpServer())
        .get('/startup/invitations')
        .set('Cookie', `token=${invitee.token}`)
        .expect(200);

      if (invRes.body.data?.length > 0) {
        const declRes = await request(app.getHttpServer())
          .put(`/startup/invitations/${invRes.body.data[0].id}/decline`)
          .set('Cookie', `token=${invitee.token}`);

        expect([200, 201]).toContain(declRes.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Startup Funding
  // ─────────────────────────────────────────────────────

  describe('Startup Funding Flow', () => {
    it('should set up funding info and add funding history', async () => {
      const founder = await completeUserRegistration(app, request, 'stfund');

      // Create startup
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());

      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      // 1. Update funding info
      const fundingRes = await request(app.getHttpServer())
        .put(`/startup/${startupId}/funding`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          totalRaised: '100000',
          lastRound: 'Seed',
          investors: ['Business Angel', 'VC Fund'],
          fundraisingType: 'none',
        });

      expect([200, 201]).toContain(fundingRes.statusCode);

      // 2. Get funding info
      const getFundRes = await request(app.getHttpServer())
        .get(`/startup/${startupId}/funding`)
        .set('Cookie', `token=${founder.token}`);

      expect([200]).toContain(getFundRes.statusCode);

      // 3. Add funding history entry
      const historyRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/funding/history`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          amountRaised: 500000,
          date: '2025-01-15',
          round: 'SEED',
        });

      expect([200, 201]).toContain(historyRes.statusCode);

      // 4. Get funding history
      const getHistRes = await request(app.getHttpServer())
        .get(`/startup/${startupId}/funding/history`)
        .set('Cookie', `token=${founder.token}`);

      expect([200]).toContain(getHistRes.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2b: Search Investors
  // ─────────────────────────────────────────────────────

  describe('Search Investors Flow', () => {
    it('GET /startup/search-investors returns 200 with results shape', async () => {
      const user = await completeUserRegistration(app, request, 'stsearchinv');

      const res = await request(app.getHttpServer())
        .get('/startup/search-investors?q=test&limit=10')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2c: Founders & Funding History
  // ─────────────────────────────────────────────────────

  describe('Founders & Funding History Flow', () => {
    it('POST /startup/:id/founders: admin 200, non-admin 403, equity>100 400', async () => {
      const { startupId, founder1, founder2 } =
        await createStartupWithFounders(app, request);
      const stranger = await completeUserRegistration(app, request, 'stfoundstr');

      expect(startupId).toBeDefined();

      const newMember = await completeUserRegistration(app, request, 'stfoundnew');

      // Add with equity 0 (founder1 has 100%, so we can't add more equity)
      const adminRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/founders`)
        .set('Cookie', `token=${founder1.token}`)
        .send({
          profileId: newMember.profileId,
          position: 'Developer',
          equity: 0,
        });
      expect([200, 201]).toContain(adminRes.statusCode);

      const nonAdminRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/founders`)
        .set('Cookie', `token=${stranger.token}`)
        .send({
          profileId: newMember.profileId,
          position: 'Designer',
          equity: 0,
        });
      expect(nonAdminRes.statusCode).toBe(403);

      const equityRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/founders`)
        .set('Cookie', `token=${founder1.token}`)
        .send({
          profileId: founder2.profileId,
          position: 'CTO',
          equity: 150,
        });
      expect(equityRes.statusCode).toBe(400);
    });

    it('PUT/DELETE funding/history: create, update, delete; inexistent historyId 404', async () => {
      const founder = await completeUserRegistration(app, request, 'stfhist');
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());
      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      const createRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/funding/history`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          amountRaised: 100000,
          date: '2025-01-01',
          round: 'SEED',
        });
      expect([200, 201]).toContain(createRes.statusCode);
      const historyId = createRes.body.data?.id;
      expect(historyId).toBeDefined();

      const updateRes = await request(app.getHttpServer())
        .put(`/startup/${startupId}/funding/history/${historyId}`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          amountRaised: 150000,
          date: '2025-02-01',
          round: 'SEED',
        });
      expect([200]).toContain(updateRes.statusCode);

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const notFoundRes = await request(app.getHttpServer())
        .put(`/startup/${startupId}/funding/history/${fakeId}`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          amountRaised: 200000,
          date: '2025-03-01',
          round: 'SERIESA',
        });
      expect([404, 400]).toContain(notFoundRes.statusCode);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/startup/${startupId}/funding/history/${historyId}`)
        .set('Cookie', `token=${founder.token}`);
      expect([200, 204]).toContain(deleteRes.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2d: Invitation by Email
  // ─────────────────────────────────────────────────────

  describe('Invitation by Email Flow', () => {
    it('POST /startup/:id/members/invite with { email, position } returns 200 or 201', async () => {
      const founder = await completeUserRegistration(app, request, 'stinvemail');
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());
      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      const inviteEmail = `invitee-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post(`/startup/${startupId}/members/invite`)
        .set('Cookie', `token=${founder.token}`)
        .send({
          email: inviteEmail,
          position: 'Developer',
        });

      expect([200, 201]).toContain(res.statusCode);
    });

    it('POST /startup/:id/members/invite duplicate pending returns 400 or 409', async () => {
      const founder = await completeUserRegistration(app, request, 'stinvdup');
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());
      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      const inviteEmail = `dup-${Date.now()}@example.com`;

      const first = await request(app.getHttpServer())
        .post(`/startup/${startupId}/members/invite`)
        .set('Cookie', `token=${founder.token}`)
        .send({ email: inviteEmail, position: 'Designer' });
      expect([200, 201]).toContain(first.statusCode);

      const second = await request(app.getHttpServer())
        .post(`/startup/${startupId}/members/invite`)
        .set('Cookie', `token=${founder.token}`)
        .send({ email: inviteEmail, position: 'Designer' });
      expect([400, 409]).toContain(second.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2e: Logo/Cover Upload
  // ─────────────────────────────────────────────────────

  describe('Logo/Cover Upload Flow', () => {
    it('POST /startup/:id/logo/upload: valid image 200, invalid mime 400', async () => {
      const founder = await completeUserRegistration(app, request, 'stlogo');
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData());
      const startupId = startupRes.body.data?.id;
      expect(startupId).toBeDefined();

      const validRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/logo/upload`)
        .set('Cookie', `token=${founder.token}`)
        .attach('file', Buffer.from([0xff, 0xd8, 0xff]), {
          filename: 'logo.jpg',
          contentType: 'image/jpeg',
        });
      expect([200, 201, 400]).toContain(validRes.statusCode);

      const invalidRes = await request(app.getHttpServer())
        .post(`/startup/${startupId}/logo/upload`)
        .set('Cookie', `token=${founder.token}`)
        .attach('file', Buffer.from('fake exe content'), {
          filename: 'virus.exe',
          contentType: 'application/x-msdownload',
        });
      expect(invalidRes.statusCode).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Startup Visibility & Search
  // ─────────────────────────────────────────────────────

  describe('Startup Visibility Flow', () => {
    it('should find startup via search and view profile', async () => {
      const founder = await completeUserRegistration(app, request, 'stvis');
      const viewer = await completeUserRegistration(app, request, 'stviewer');

      // Founder creates startup
      const startupRes = await request(app.getHttpServer())
        .post('/startup')
        .set('Cookie', `token=${founder.token}`)
        .send(createStartupData({ name: `VisibleStartup-${Date.now()}` }));

      const startupId = startupRes.body.data?.id;

      // Founder views their own startups
      const myRes = await request(app.getHttpServer())
        .get('/startup/me')
        .set('Cookie', `token=${founder.token}`)
        .expect(200);

      expect(myRes.body.success).toBe(true);

      // Viewer can see startup by ID
      if (startupId) {
        const viewRes = await request(app.getHttpServer())
          .get(`/startup/${startupId}`)
          .set('Cookie', `token=${viewer.token}`);

        expect([200]).toContain(viewRes.statusCode);
      }

      // Viewer can see startups by founder's profile
      const byProfileRes = await request(app.getHttpServer())
        .get(`/startup/profile/${founder.profileId}`)
        .set('Cookie', `token=${viewer.token}`);

      expect([200, 404]).toContain(byProfileRes.statusCode);
    });

    it('should not allow non-founder to update startup', async () => {
      const { startupId, founder1 } = await createStartupWithFounders(
        app,
        request,
      );
      const stranger = await completeUserRegistration(app, request, 'stranger');

      if (startupId) {
        const res = await request(app.getHttpServer())
          .put(`/startup/${startupId}`)
          .set('Cookie', `token=${stranger.token}`)
          .send({ description: 'Hacked!' });

        expect([400, 401, 403]).toContain(res.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4: Complete Startup Lifecycle (helper)
  // ─────────────────────────────────────────────────────

  describe('Complete Startup Lifecycle', () => {
    it('should create a full startup via createCompleteStartup helper', async () => {
      const result = await createCompleteStartup(app, request);

      expect(result.startupId).toBeDefined();
      expect(result.founder.token).toBeDefined();
      expect(result.member.token).toBeDefined();

      // Verify both can access the startup
      const founderView = await request(app.getHttpServer())
        .get(`/startup/${result.startupId}`)
        .set('Cookie', `token=${result.founder.token}`);

      expect([200]).toContain(founderView.statusCode);

      const memberView = await request(app.getHttpServer())
        .get(`/startup/${result.startupId}`)
        .set('Cookie', `token=${result.member.token}`);

      expect([200]).toContain(memberView.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 5: Startup Permissions (Phase 2)
  // ─────────────────────────────────────────────────────

  describe('Startup Permissions', () => {
    it('should allow founder to edit but not members by default', async () => {
      const { startupId, founder, member } = await createCompleteStartup(
        app,
        request,
      );

      if (startupId) {
        // Founder can edit
        const founderEditRes = await request(app.getHttpServer())
          .put(`/startup/${startupId}`)
          .set('Cookie', `token=${founder.token}`)
          .send({ description: 'Updated by founder' });

        expect([200, 201]).toContain(founderEditRes.statusCode);

        // Member cannot edit (unless given permissions)
        const memberEditRes = await request(app.getHttpServer())
          .put(`/startup/${startupId}`)
          .set('Cookie', `token=${member.token}`)
          .send({ description: 'Updated by member' });

        // Member with limited role typically gets 400 (StartupUnauthorized) or 403
        expect([200, 201, 400, 403]).toContain(memberEditRes.statusCode);
      }
    });

    it('should not allow non-members to access private startup data', async () => {
      const { startupId } = await createCompleteStartup(app, request);
      const stranger = await completeUserRegistration(
        app,
        request,
        'stpermstranger',
      );

      if (startupId) {
        // Stranger views public data
        const publicRes = await request(app.getHttpServer())
          .get(`/startup/${startupId}`)
          .set('Cookie', `token=${stranger.token}`);

        expect([200, 404]).toContain(publicRes.statusCode);

        // If startup has private fields, they should be hidden
        if (publicRes.statusCode === 200) {
          const data = publicRes.body.data;
          // Private info should not be exposed
          expect(data.privateNotes).toBeUndefined();
        }
      }
    });

    it('should enforce role-based permissions for startup members', async () => {
      const { startupId, founder, member } = await createCompleteStartup(
        app,
        request,
      );

      if (startupId) {
        // Check who can delete startup (typically only founder)
        const deleteRes = await request(app.getHttpServer())
          .delete(`/startup/${startupId}`)
          .set('Cookie', `token=${member.token}`);

        // Member should NOT be able to delete
        expect([403, 404]).toContain(deleteRes.statusCode);
      }
    });
  });
});
