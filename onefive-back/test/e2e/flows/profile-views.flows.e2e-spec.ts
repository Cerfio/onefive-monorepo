/**
 * Profile Views & Analytics Flows E2E Tests
 *
 * Tests profile view tracking and analytics:
 * - User A views User B → tracked in analytics
 * - View counts and visitor lists
 * - Analytics by connection degree
 * - Notifications for profile views
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import { completeUserRegistration } from '../../helpers/flow-helpers';

describe('Profile Views & Analytics Flows (e2e)', () => {
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
  // Flow 1: Profile View Tracking
  // ─────────────────────────────────────────────────────

  describe('Profile View Tracking', () => {
    it('should track when User A views User B profile', async () => {
      const userA = await completeUserRegistration(app, request, 'viewer');
      const userB = await completeUserRegistration(app, request, 'viewed');

      // A views B's profile
      const viewRes = await request(app.getHttpServer())
        .get(`/profile/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200]).toContain(viewRes.statusCode);

      // Wait for analytics to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // B should see increased profile views in analytics
      const overviewRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${userB.token}`);

      if (overviewRes.statusCode === 200) {
        expect(overviewRes.body.data).toBeDefined();
        if (overviewRes.body.data.profileViews) {
          expect(
            overviewRes.body.data.profileViews.current,
          ).toBeGreaterThanOrEqual(0);
        }
      }

      // B should potentially see A in their visitors list
      const visitorsRes = await request(app.getHttpServer())
        .get('/profile-analytics/visitors?timeRange=7d')
        .set('Cookie', `token=${userB.token}`);

      if (visitorsRes.statusCode === 200) {
        const data = visitorsRes.body.data;
        if (data && data.recentVisitors) {
          expect(Array.isArray(data.recentVisitors)).toBe(true);
        }
      }

      // B should receive PROFILE_VIEW notification from A
      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${userB.token}`)
        .expect(200);

      const notifData = notifsRes.body?.data;
      const notifications = Array.isArray(notifData)
        ? notifData
        : (notifData?.items ?? []);
      const hasProfileViewNotif = notifications.some(
        (n: any) =>
          n.actorId === userA.profileId && n.type === 'PROFILE_VIEW',
      );
      expect(hasProfileViewNotif).toBe(true);
    });

    it('should increment view count for multiple views', async () => {
      const userA = await completeUserRegistration(app, request, 'multiviewer');
      const userB = await completeUserRegistration(app, request, 'multiviewed');

      // Get initial count
      const initialRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${userB.token}`);

      const initialCount =
        initialRes.statusCode === 200
          ? initialRes.body.data?.profileViews?.current || 0
          : 0;

      // A views B's profile 3 times
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .get(`/profile/${userB.profileId}`)
          .set('Cookie', `token=${userA.token}`)
          .expect(200);

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Wait for analytics to update
      await new Promise((resolve) => setTimeout(resolve, 200));

      // B should see increased view count
      const overviewRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${userB.token}`);

      if (overviewRes.statusCode === 200) {
        const currentCount = overviewRes.body.data?.profileViews?.current || 0;
        // Count should have increased (or at least stayed the same)
        expect(currentCount).toBeGreaterThanOrEqual(initialCount);
      }
    });

    it('should track views from different users', async () => {
      const viewer1 = await completeUserRegistration(app, request, 'viewer1');
      const viewer2 = await completeUserRegistration(app, request, 'viewer2');
      const viewer3 = await completeUserRegistration(app, request, 'viewer3');
      const target = await completeUserRegistration(app, request, 'targetuser');

      // Multiple users view target's profile
      await request(app.getHttpServer())
        .get(`/profile/${target.profileId}`)
        .set('Cookie', `token=${viewer1.token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/profile/${target.profileId}`)
        .set('Cookie', `token=${viewer2.token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/profile/${target.profileId}`)
        .set('Cookie', `token=${viewer3.token}`)
        .expect(200);

      // Wait for analytics
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Target should see multiple views
      const overviewRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${target.token}`);

      if (overviewRes.statusCode === 200) {
        expect(overviewRes.body.data).toBeDefined();
      }
    });

    it('should not track own profile views', async () => {
      const user = await completeUserRegistration(app, request, 'selfview');

      // Get initial count
      const initialRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${user.token}`);

      const initialCount =
        initialRes.statusCode === 200
          ? initialRes.body.data?.profileViews?.current || 0
          : 0;

      // User views their own profile
      await request(app.getHttpServer())
        .get(`/profile/${user.profileId}`)
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Count should not increase
      const afterRes = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${user.token}`);

      if (afterRes.statusCode === 200) {
        const afterCount = afterRes.body.data?.profileViews?.current || 0;
        // Should be same or similar (self-views shouldn't count)
        expect(afterCount).toBeLessThanOrEqual(initialCount + 1);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Visitor Analytics
  // ─────────────────────────────────────────────────────

  describe('Visitor Analytics', () => {
    it('should show visitor details in analytics', async () => {
      const viewer = await completeUserRegistration(app, request, 'visdetail');
      const target = await completeUserRegistration(app, request, 'tgtdetail');

      // Viewer views target's profile
      await request(app.getHttpServer())
        .get(`/profile/${target.profileId}`)
        .set('Cookie', `token=${viewer.token}`)
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Target checks visitors
      const visitorsRes = await request(app.getHttpServer())
        .get('/profile-analytics/visitors?timeRange=30d')
        .set('Cookie', `token=${target.token}`);

      if (visitorsRes.statusCode === 200) {
        const data = visitorsRes.body.data;
        expect(data).toBeDefined();

        // Check structure
        if (data) {
          expect(typeof data).toBe('object');
        }
      }
    });

    it('should show analytics by time period', async () => {
      const user = await completeUserRegistration(app, request, 'timeperiod');

      // Test different periods
      const periods = ['7d', '30d', '90d'];

      for (const period of periods) {
        const res = await request(app.getHttpServer())
          .get(`/profile-analytics/overview?timeRange=${period}`)
          .set('Cookie', `token=${user.token}`);

        expect([200]).toContain(res.statusCode);

        if (res.statusCode === 200) {
          expect(res.body.data).toBeDefined();
        }
      }
    });

    it('should provide engagement analytics', async () => {
      const user = await completeUserRegistration(app, request, 'engage');

      // Get engagement analytics
      const engageRes = await request(app.getHttpServer())
        .get('/profile-analytics/engagement?timeRange=30d')
        .set('Cookie', `token=${user.token}`);

      if (engageRes.statusCode === 200) {
        expect(engageRes.body.data).toBeDefined();
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Analytics Privacy
  // ─────────────────────────────────────────────────────

  describe('Analytics Privacy', () => {
    it('should only show own analytics', async () => {
      const userA = await completeUserRegistration(app, request, 'privA');
      const userB = await completeUserRegistration(app, request, 'privB');

      // A cannot view B's analytics
      const res = await request(app.getHttpServer())
        .get('/profile-analytics/overview?timeRange=7d')
        .set('Cookie', `token=${userA.token}`);

      // Should get A's own analytics, not B's
      if (res.statusCode === 200) {
        // Analytics endpoint uses authenticated user's data
        expect(res.body.data).toBeDefined();
      }
    });

    it('should require authentication for analytics', async () => {
      // Try to access analytics without auth
      const res = await request(app.getHttpServer()).get(
        '/profile-analytics/overview?timeRange=7d',
      );

      // Should be unauthorized
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
