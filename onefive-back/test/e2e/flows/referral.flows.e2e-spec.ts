/**
 * Referral Flows E2E Tests
 *
 * Tests referral via link flow (?ref=):
 * - User shares link, new user signs up with ref, verifies email → referral accepted
 * - Leaderboard, stats, my-referrals
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  extractAuthTokenFromResponse,
  validPassword,
  createProfileData,
  createUniqueEmail,
} from '../../helpers/fixtures';
import { completeUserRegistration } from '../../helpers/flow-helpers';

describe('Referral Flows (e2e)', () => {
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
  // Flow 1: Link-based referral & stats
  // ─────────────────────────────────────────────────────

  describe('Referral via Link Flow', () => {
    it('should fetch referral stats and leaderboard', async () => {
      const user = await completeUserRegistration(app, request, 'refstats');

      const statsRes = await request(app.getHttpServer())
        .get('/referral/stats')
        .set('Cookie', `token=${user.token}`);

      expect(statsRes.statusCode).toBe(200);
      expect(statsRes.body.data).toBeDefined();
      expect(statsRes.body.data).toHaveProperty('totalAccepted');

      const myRefRes = await request(app.getHttpServer())
        .get('/referral/my-referrals')
        .set('Cookie', `token=${user.token}`);

      expect(myRefRes.statusCode).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Leaderboard
  // ─────────────────────────────────────────────────────

  describe('Referral Leaderboard Flow', () => {
    it('should fetch the referral leaderboard', async () => {
      const user = await completeUserRegistration(app, request, 'leaderb');

      const leaderRes = await request(app.getHttpServer())
        .get('/referral/leaderboard?limit=10')
        .set('Cookie', `token=${user.token}`);

      expect(leaderRes.statusCode).toBe(200);
      expect(leaderRes.body.data).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: REFERRAL_ACCEPTED via link (?ref=)
  // ─────────────────────────────────────────────────────

  describe('Referral Accepted Notification (link flow)', () => {
    it('should notify referrer when new user signs up via link and verifies email', async () => {
      const referrer = await completeUserRegistration(
        app,
        request,
        'refaccref',
      );

      // Get referrer's referral code from waitlist status
      const statusRes = await request(app.getHttpServer())
        .get('/waitlist/status')
        .set('Cookie', `token=${referrer.token}`)
        .expect(200);

      const referralCode = statusRes.body?.data?.referralCode;
      expect(referralCode).toBeDefined();

      const invitedEmail = createUniqueEmail('refacc');

      // Invited user signs up
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: invitedEmail, password: validPassword })
        .expect(201);

      const invitedToken = extractAuthTokenFromResponse(signupRes);
      expect(invitedToken).toBeDefined();

      // Create profile with referredByCode (simulates ?ref= in URL)
      const profilePayload = createProfileData({
        firstName: 'Invited',
        lastName: 'User',
      });
      await request(app.getHttpServer())
        .post('/profile')
        .set('Cookie', `token=${invitedToken}`)
        .send({ ...profilePayload, referredByCode: referralCode })
        .expect(201);

      const invitedUser = await context.prisma.user.findUnique({
        where: { email: invitedEmail },
        select: { id: true },
      });
      expect(invitedUser).toBeDefined();

      const testCode = 'TEST';
      await context.prisma.emailVerification.upsert({
        where: { userId: invitedUser!.id },
        create: {
          userId: invitedUser!.id,
          emailCode: testCode,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000),
        },
        update: {
          emailCode: testCode,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000),
        },
      });

      await request(app.getHttpServer())
        .post('/auth/email/confirm')
        .set('Cookie', `token=${invitedToken}`)
        .send({ code: testCode })
        .expect(200);

      await new Promise((r) => setTimeout(r, 150));

      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${referrer.token}`)
        .expect(200);

      const notifData = notifsRes.body?.data;
      const items = Array.isArray(notifData)
        ? notifData
        : (notifData?.items ?? notifData?.notifications ?? []);
      const hasRefAccepted = items.some(
        (n: any) =>
          n.type === 'REFERRAL_ACCEPTED' || n.entityType === 'REFERRAL',
      );
      expect(hasRefAccepted).toBe(true);
    });
  });
});
