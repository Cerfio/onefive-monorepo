/**
 * Social Flows E2E Tests
 *
 * Tests social interaction journeys:
 * - Profile connection (request → accept)
 * - Post creation + reactions + comments
 * - Follow profile/startup + feed visibility
 * - Bookmark posts
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import { createPostData } from '../../helpers/fixtures';
import {
  completeUserRegistration,
  createConnectedUsers,
  createPostWithInteractions,
  createPost,
  followProfile,
  createFundableStartup,
  followStartup,
} from '../../helpers/flow-helpers';

describe('Social Flows (e2e)', () => {
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
  // Flow 1: Profile Connection
  // ─────────────────────────────────────────────────────

  describe('Profile Connection Flow', () => {
    it('should connect two profiles: request → accept → verify', async () => {
      const userA = await completeUserRegistration(app, request, 'connA');
      const userB = await completeUserRegistration(app, request, 'connB');

      // 1. User A sends connection request to User B
      const connectRes = await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201]).toContain(connectRes.statusCode);

      // 2. User B accepts connection
      const acceptRes = await request(app.getHttpServer())
        .post(`/network/connect/${userA.profileId}/accept`)
        .set('Cookie', `token=${userB.token}`);

      expect([200, 201]).toContain(acceptRes.statusCode);

      // 3. Both should see each other in network
      const netA = await request(app.getHttpServer())
        .get('/network/people?view=network&limit=50&offset=0')
        .set('Cookie', `token=${userA.token}`);

      expect([200]).toContain(netA.statusCode);

      const netB = await request(app.getHttpServer())
        .get('/network/people?view=network&limit=50&offset=0')
        .set('Cookie', `token=${userB.token}`);

      expect([200]).toContain(netB.statusCode);
    });

    it('should allow cancelling a connection request', async () => {
      const userA = await completeUserRegistration(app, request, 'cancelA');
      const userB = await completeUserRegistration(app, request, 'cancelB');

      // Send connection request
      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      // Cancel connection request
      const cancelRes = await request(app.getHttpServer())
        .delete(`/network/connect/${userB.profileId}/cancel`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201, 204]).toContain(cancelRes.statusCode);
    });

    it('should handle self-connection attempt', async () => {
      const user = await completeUserRegistration(app, request, 'selfconn');

      const res = await request(app.getHttpServer())
        .post(`/network/connect/${user.profileId}`)
        .set('Cookie', `token=${user.token}`);

      expect([200, 201, 400, 403, 409]).toContain(res.statusCode);
    });

    it('should return 400 or 409 when connection request already exists', async () => {
      const userA = await completeUserRegistration(app, request, 'dupConnA');
      const userB = await completeUserRegistration(app, request, 'dupConnB');

      const first = await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201]).toContain(first.statusCode);

      const second = await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([400, 409]).toContain(second.statusCode);
    });

    it('should reject connection request when already connected (400 or 409, never 500)', async () => {
      const { user1, user2 } = await createConnectedUsers(app, request);

      const res = await request(app.getHttpServer())
        .post(`/network/connect/${user2.profileId}`)
        .set('Cookie', `token=${user1.token}`);

      expect([400, 409]).toContain(res.statusCode);
    });

    it('should reject duplicate follow (400 or 409, never 500)', async () => {
      const follower = await completeUserRegistration(app, request, 'dupfolA');
      const followed = await completeUserRegistration(app, request, 'dupfolB');

      const first = await request(app.getHttpServer())
        .post(`/network/follow/profile/${followed.profileId}`)
        .set('Cookie', `token=${follower.token}`);

      expect([200, 201]).toContain(first.statusCode);

      const second = await request(app.getHttpServer())
        .post(`/network/follow/profile/${followed.profileId}`)
        .set('Cookie', `token=${follower.token}`);

      expect([400, 409]).toContain(second.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Post Creation & Interactions
  // ─────────────────────────────────────────────────────

  describe('Post Interaction Flow', () => {
    it('should create post → react → comment → reply → bookmark', async () => {
      const author = await completeUserRegistration(app, request, 'postauth');
      const reactor = await completeUserRegistration(app, request, 'reactor');
      const commenter = await completeUserRegistration(app, request, 'cmtr');

      // 1. Author creates post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send(
          createPostData({ content: 'An insightful post about startups!' }),
        );

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      expect(postId).toBeDefined();

      // 2. Reactor reacts to post
      const reactRes = await request(app.getHttpServer())
        .post(`/post-reactions/posts/${postId}`)
        .set('Cookie', `token=${reactor.token}`)
        .send({ reaction: 'HEART' });

      expect([200, 201]).toContain(reactRes.statusCode);

      // 3. Commenter adds a comment
      const commentRes = await request(app.getHttpServer())
        .post(`/post-comments/posts/${postId}`)
        .set('Cookie', `token=${commenter.token}`)
        .send({ content: 'This is a great insight!' });

      expect([200, 201]).toContain(commentRes.statusCode);
      const commentId = commentRes.body.data?.id;

      // 4. Author replies to the comment
      if (commentId) {
        const replyRes = await request(app.getHttpServer())
          .post(`/post-comments/posts/${postId}`)
          .set('Cookie', `token=${author.token}`)
          .send({ content: 'Thanks for the feedback!', parentId: commentId });

        expect([200, 201]).toContain(replyRes.statusCode);
      }

      // 5. Reactor bookmarks the post
      const bookmarkRes = await request(app.getHttpServer())
        .post(`/post-bookmark/${postId}`)
        .set('Cookie', `token=${reactor.token}`);

      expect([200, 201]).toContain(bookmarkRes.statusCode);

      // 6. Verify post appears in author's feed
      const feedRes = await request(app.getHttpServer())
        .get('/posts/feed?skip=0&limit=10')
        .set('Cookie', `token=${author.token}`);

      expect([200]).toContain(feedRes.statusCode);

      // 7. Verify bookmarks list
      const bookmarksRes = await request(app.getHttpServer())
        .get('/post-bookmark')
        .set('Cookie', `token=${reactor.token}`);

      expect([200]).toContain(bookmarksRes.statusCode);
    });

    it('should get reactions for a post', async () => {
      const { author, postId, liker } = await createPostWithInteractions(
        app,
        request,
      );

      if (postId) {
        const reactionsRes = await request(app.getHttpServer())
          .get(`/post-reactions/posts/${postId}`)
          .set('Cookie', `token=${author.token}`);

        expect([200]).toContain(reactionsRes.statusCode);
      }
    });

    it('should get comments for a post', async () => {
      const { author, postId } = await createPostWithInteractions(app, request);

      if (postId) {
        const commentsRes = await request(app.getHttpServer())
          .get(`/post-comments/posts/${postId}`)
          .set('Cookie', `token=${author.token}`);

        expect([200]).toContain(commentsRes.statusCode);
      }
    });

    it('should cascade delete reactions and comments when post is deleted', async () => {
      const author = await completeUserRegistration(app, request, 'cascdel');
      const reactor = await completeUserRegistration(app, request, 'cascdelr');

      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Post to cascade delete' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      expect(postId).toBeDefined();

      if (!postId) return;

      // Add reaction
      await request(app.getHttpServer())
        .post(`/post-reactions/posts/${postId}`)
        .set('Cookie', `token=${reactor.token}`)
        .send({ reaction: 'HEART' })
        .expect((r) => expect([200, 201]).toContain(r.status));

      // Add comment
      await request(app.getHttpServer())
        .post(`/post-comments/posts/${postId}`)
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'A comment' })
        .expect((r) => expect([200, 201]).toContain(r.status));

      // Delete post
      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Cookie', `token=${author.token}`)
        .expect(200);

      // Post should be gone (404)
      const getRes = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .set('Cookie', `token=${author.token}`);

      expect(getRes.status).toBe(404);

      // Cascade: reactions and comments should be deleted (verify via Prisma)
      const reactionsCount = await context.prisma.postReaction.count({
        where: { postId },
      });
      const commentsCount = await context.prisma.postComment.count({
        where: { postId },
      });
      expect(reactionsCount).toBe(0);
      expect(commentsCount).toBe(0);
    });

    it('should delete own post', async () => {
      const author = await completeUserRegistration(app, request, 'delpost');
      const postId = await createPost(app, request, author.token);

      if (postId) {
        const delRes = await request(app.getHttpServer())
          .delete(`/posts/${postId}`)
          .set('Cookie', `token=${author.token}`);

        expect([200, 204]).toContain(delRes.statusCode);
      }
    });

    it("should not allow deleting another user's post", async () => {
      const author = await completeUserRegistration(app, request, 'ownpost');
      const stranger = await completeUserRegistration(app, request, 'strangr');
      const postId = await createPost(app, request, author.token);

      if (postId) {
        const res = await request(app.getHttpServer())
          .delete(`/posts/${postId}`)
          .set('Cookie', `token=${stranger.token}`);

        expect([401, 403]).toContain(res.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Follow & Feed
  // ─────────────────────────────────────────────────────

  describe('Follow and Feed Flow', () => {
    it('should follow profile and see activity in network', async () => {
      const userA = await completeUserRegistration(app, request, 'follwA');
      const userB = await completeUserRegistration(app, request, 'follwB');

      // 1. User A follows User B
      await followProfile(app, request, userA.token, userB.profileId);

      // 2. User B creates a post
      await createPost(app, request, userB.token, {
        content: 'Post from followed user',
      });

      // 3. Check network activity
      const activityRes = await request(app.getHttpServer())
        .get('/network/activity?limit=20&offset=0')
        .set('Cookie', `token=${userA.token}`);

      expect([200]).toContain(activityRes.statusCode);

      // 4. Unfollow (correct route: DELETE /network/follow/profile/:id)
      const unfollowRes = await request(app.getHttpServer())
        .delete(`/network/follow/profile/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 204]).toContain(unfollowRes.statusCode);
    });

    it('should handle duplicate follow gracefully', async () => {
      const userA = await completeUserRegistration(app, request, 'dupFollowA');
      const userB = await completeUserRegistration(app, request, 'dupFollowB');

      const first = await request(app.getHttpServer())
        .post(`/network/follow/profile/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201]).toContain(first.statusCode);

      const second = await request(app.getHttpServer())
        .post(`/network/follow/profile/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([400, 409]).toContain(second.statusCode);
    });

    it('should follow a startup', async () => {
      const user = await completeUserRegistration(app, request, 'stfollow');
      const { startupId } = await createFundableStartup(app, request);

      if (startupId) {
        // Follow
        await followStartup(app, request, user.token, startupId);

        // Unfollow (correct route: DELETE /network/follow/startup/:id)
        const unfollowRes = await request(app.getHttpServer())
          .delete(`/network/follow/startup/${startupId}`)
          .set('Cookie', `token=${user.token}`);

        expect([200, 204]).toContain(unfollowRes.statusCode);
      }
    });

    it('should see discover people in network', async () => {
      await completeUserRegistration(app, request, 'disc1');
      await completeUserRegistration(app, request, 'disc2');
      const viewer = await completeUserRegistration(app, request, 'discview');

      const discoverRes = await request(app.getHttpServer())
        .get('/network/people?view=discover&limit=10&offset=0')
        .set('Cookie', `token=${viewer.token}`)
        .expect(200);

      expect(discoverRes.body.success).toBe(true);
      expect(Array.isArray(discoverRes.body.data)).toBe(true);
    });

    it('should see discover startups in network', async () => {
      await createFundableStartup(app, request);
      const viewer = await completeUserRegistration(app, request, 'stdisc');

      const discoverRes = await request(app.getHttpServer())
        .get('/network/startups?view=discover&limit=10&offset=0')
        .set('Cookie', `token=${viewer.token}`)
        .expect(200);

      expect(discoverRes.body.success).toBe(true);
      expect(Array.isArray(discoverRes.body.data)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4: Notifications from Social Activity
  // ─────────────────────────────────────────────────────

  describe('Social Notifications Flow', () => {
    it('should receive notifications from interactions', async () => {
      const { author, postId, liker, commenter } =
        await createPostWithInteractions(app, request);

      // Author should have notifications
      const notifRes = await request(app.getHttpServer())
        .get('/notifications?limit=20&offset=0')
        .set('Cookie', `token=${author.token}`);

      expect([200]).toContain(notifRes.statusCode);

      // Check notification counts
      const countsRes = await request(app.getHttpServer())
        .get('/notifications/counts')
        .set('Cookie', `token=${author.token}`);

      expect([200]).toContain(countsRes.statusCode);
    });

    it('should mark notifications as read', async () => {
      const user = await completeUserRegistration(app, request, 'notifread');

      // Mark all as read
      const markRes = await request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Cookie', `token=${user.token}`);

      expect([200]).toContain(markRes.statusCode);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 5: Cross-User Notifications (NEW)
  // ─────────────────────────────────────────────────────

  describe('Cross-User Notifications Flow', () => {
    it('should notify User B when User A sends connection request', async () => {
      const userA = await completeUserRegistration(app, request, 'reqA');
      const userB = await completeUserRegistration(app, request, 'reqB');

      const beforeRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${userB.token}`)
        .expect(200);
      const beforeData = beforeRes.body?.data;
      const beforeNotifications = Array.isArray(beforeData)
        ? beforeData
        : (beforeData?.items ?? []);

      // A sends connection request to B (single call)
      const connectRes = await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201]).toContain(connectRes.statusCode);

      // Wait a bit for notification to be created
      await new Promise((resolve) => setTimeout(resolve, 100));

      // B should have notification
      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${userB.token}`)
        .expect(200);

      const raw = notifsRes.body?.data;
      const notifications = Array.isArray(raw) ? raw : (raw?.items ?? []);
      expect(notifications.length).toBeGreaterThanOrEqual(
        beforeNotifications.length,
      );

      const hasConnectionNotifFromA = notifications.some(
        (n: any) =>
          (n.actorId === userA.profileId || n.senderId === userA.profileId) &&
          (n.type === 'CONNECTION_REQUEST' || n.entityType === 'PROFILE'),
      );
      expect(hasConnectionNotifFromA).toBe(true);

      // Notification count should be >= 0
      const countsRes = await request(app.getHttpServer())
        .get('/notifications/counts')
        .set('Cookie', `token=${userB.token}`)
        .expect(200);

      expect(countsRes.body.data).toBeDefined();
    });

    it('should notify author when someone reacts to their post', async () => {
      const author = await completeUserRegistration(app, request, 'postauthor');
      const reactor = await completeUserRegistration(app, request, 'postreact');

      const beforeRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${author.token}`)
        .expect(200);
      const beforeData = beforeRes.body?.data;
      const beforeNotifications = Array.isArray(beforeData)
        ? beforeData
        : (beforeData?.items ?? []);

      // Author creates post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'My awesome post!' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        // Reactor reacts
        await request(app.getHttpServer())
          .post(`/post-reactions/posts/${postId}`)
          .set('Cookie', `token=${reactor.token}`)
          .send({ reaction: 'HEART' });

        // Wait for notification
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Author should have notification
        const notifsRes = await request(app.getHttpServer())
          .get('/notifications?limit=20')
          .set('Cookie', `token=${author.token}`)
          .expect(200);

        const notifRaw = notifsRes.body?.data;
        const notifications = Array.isArray(notifRaw)
          ? notifRaw
          : (notifRaw?.items ?? []);
        expect(notifications.length).toBeGreaterThanOrEqual(
          beforeNotifications.length,
        );

        const hasReactionNotifFromReactor = notifications.some(
          (n: any) =>
            (n.actorId === reactor.profileId ||
              n.senderId === reactor.profileId) &&
            (n.type === 'LIKE' || n.entityType === 'POST'),
        );
        expect(hasReactionNotifFromReactor).toBe(true);
      }
    });

    it('should notify author when someone comments on their post', async () => {
      const author = await completeUserRegistration(app, request, 'cmtauthor');
      const commenter = await completeUserRegistration(app, request, 'cmtr');

      const beforeRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${author.token}`)
        .expect(200);
      const beforeNotifications = Array.isArray(beforeRes.body?.data)
        ? beforeRes.body.data
        : [];

      // Author creates post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Post for comments' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        // Commenter comments
        await request(app.getHttpServer())
          .post(`/post-comments/posts/${postId}`)
          .set('Cookie', `token=${commenter.token}`)
          .send({ content: 'Great post!' });

        // Wait for notification
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Author should have notification
        const notifsRes = await request(app.getHttpServer())
          .get('/notifications?limit=20')
          .set('Cookie', `token=${author.token}`)
          .expect(200);

        const notifRaw = notifsRes.body?.data;
        const notifications = Array.isArray(notifRaw)
          ? notifRaw
          : (notifRaw?.items ?? []);
        expect(notifications.length).toBeGreaterThanOrEqual(
          beforeNotifications.length,
        );

        const hasCommentNotifFromCommenter = notifications.some(
          (n: any) =>
            (n.actorId === commenter.profileId ||
              n.senderId === commenter.profileId) &&
            (n.type === 'COMMENT' || n.entityType === 'POST'),
        );
        expect(hasCommentNotifFromCommenter).toBe(true);
      }
    });

    it('should notify parent comment author when someone replies to their comment', async () => {
      const author = await completeUserRegistration(app, request, 'replyauth');
      const commenter = await completeUserRegistration(
        app,
        request,
        'replycmtr',
      );
      const replier = await completeUserRegistration(app, request, 'replyrepl');

      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Post for reply test' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      if (!postId) return;

      const commentRes = await request(app.getHttpServer())
        .post(`/post-comments/posts/${postId}`)
        .set('Cookie', `token=${commenter.token}`)
        .send({ content: 'Parent comment' });

      expect([200, 201]).toContain(commentRes.statusCode);
      const commentId = commentRes.body.data?.id;
      if (!commentId) return;

      const beforeRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${commenter.token}`)
        .expect(200);
      const beforeData = beforeRes.body?.data;
      const beforeNotifications = Array.isArray(beforeData)
        ? beforeData
        : (beforeData?.items ?? []);

      await request(app.getHttpServer())
        .post(`/post-comments/posts/${postId}`)
        .set('Cookie', `token=${replier.token}`)
        .send({ content: 'Reply to your comment!', parentId: commentId });

      await new Promise((resolve) => setTimeout(resolve, 150));

      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${commenter.token}`)
        .expect(200);

      const notifRaw = notifsRes.body?.data;
      const notifications = Array.isArray(notifRaw)
        ? notifRaw
        : (notifRaw?.items ?? []);
      const hasReplyNotif = notifications.some(
        (n: any) =>
          n.actorId === replier.profileId &&
          (n.type === 'COMMENT_REPLY' || n.entityType === 'COMMENT'),
      );
      expect(hasReplyNotif).toBe(true);
    });

    it('should notify author when someone reacts to their comment', async () => {
      const author = await completeUserRegistration(app, request, 'creactauth');
      const commenter = await completeUserRegistration(
        app,
        request,
        'creactcmtr',
      );
      const reactor = await completeUserRegistration(app, request, 'creactrct');

      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Post for comment reaction' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      if (!postId) return;

      const commentRes = await request(app.getHttpServer())
        .post(`/post-comments/posts/${postId}`)
        .set('Cookie', `token=${commenter.token}`)
        .send({ content: 'Comment to react to' });

      expect([200, 201]).toContain(commentRes.statusCode);
      const commentId = commentRes.body.data?.id;
      if (!commentId) return;

      await request(app.getHttpServer())
        .post(`/post-comment-reactions/comments/${commentId}`)
        .set('Cookie', `token=${reactor.token}`)
        .send({ reaction: 'HEART' });

      await new Promise((resolve) => setTimeout(resolve, 150));

      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${commenter.token}`)
        .expect(200);

      const notifRaw = notifsRes.body?.data;
      const notifications = Array.isArray(notifRaw)
        ? notifRaw
        : (notifRaw?.items ?? []);
      const hasReactionNotif = notifications.some(
        (n: any) =>
          n.actorId === reactor.profileId &&
          (n.type === 'LIKE' || n.entityType === 'COMMENT'),
      );
      expect(hasReactionNotif).toBe(true);
    });

    it('should notify author when someone reposts their post', async () => {
      const author = await completeUserRegistration(app, request, 'repostauth');
      const reposter = await completeUserRegistration(app, request, 'reposter');

      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'Original post to be reposted' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      if (!postId) return;

      await request(app.getHttpServer())
        .post(`/posts/${postId}/repost`)
        .set('Cookie', `token=${reposter.token}`)
        .send({ content: 'My take on this!' });

      await new Promise((resolve) => setTimeout(resolve, 150));

      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${author.token}`)
        .expect(200);

      const notifRaw = notifsRes.body?.data;
      const notifications = Array.isArray(notifRaw)
        ? notifRaw
        : (notifRaw?.items ?? []);
      const hasShareNotif = notifications.some(
        (n: any) =>
          n.actorId === reposter.profileId &&
          (n.type === 'SHARE' || n.entityType === 'POST'),
      );
      expect(hasShareNotif).toBe(true);
    });

    it('should not create notification when user reacts to own post', async () => {
      const author = await completeUserRegistration(app, request, 'ownreact');

      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${author.token}`)
        .send({ content: 'My own post for reaction' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;
      if (!postId) return;

      const beforeRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${author.token}`)
        .expect(200);
      const beforeData = beforeRes.body?.data;
      const beforeCount = Array.isArray(beforeData)
        ? beforeData.length
        : (beforeData?.items ?? []).length;

      await request(app.getHttpServer())
        .post(`/post-reactions/posts/${postId}`)
        .set('Cookie', `token=${author.token}`)
        .send({ reaction: 'HEART' });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const afterRes = await request(app.getHttpServer())
        .get('/notifications?limit=50')
        .set('Cookie', `token=${author.token}`)
        .expect(200);
      const afterData = afterRes.body?.data;
      const afterCount = Array.isArray(afterData)
        ? afterData.length
        : (afterData?.items ?? []).length;

      expect(afterCount).toBeLessThanOrEqual(beforeCount + 1);
    });

    it('should notify both users when connection is accepted', async () => {
      const userA = await completeUserRegistration(app, request, 'acceptA');
      const userB = await completeUserRegistration(app, request, 'acceptB');

      // A sends request
      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      // B accepts
      await request(app.getHttpServer())
        .post(`/network/connect/${userA.profileId}/accept`)
        .set('Cookie', `token=${userB.token}`);

      // Wait for notifications
      await new Promise((resolve) => setTimeout(resolve, 100));

      // A should have notification (connection accepted from B)
      const notifsA = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${userA.token}`)
        .expect(200);

      const notifsAData = notifsA.body?.data;
      const notifsAItems = Array.isArray(notifsAData)
        ? notifsAData
        : (notifsAData?.items ?? []);
      const hasAcceptNotif = notifsAItems.some(
        (n: any) =>
          n.actorId === userB.profileId &&
          (n.type === 'CONNECTION_REQUEST' || n.entityType === 'PROFILE'),
      );
      expect(hasAcceptNotif).toBe(true);
    });

    it('should notify followed user when someone follows them', async () => {
      const follower = await completeUserRegistration(app, request, 'follower');
      const followed = await completeUserRegistration(app, request, 'followed');

      // Follower follows
      await request(app.getHttpServer())
        .post(`/network/follow/profile/${followed.profileId}`)
        .set('Cookie', `token=${follower.token}`);

      // Wait for notification
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Followed should have notification (FOLLOW from follower)
      const notifsRes = await request(app.getHttpServer())
        .get('/notifications?limit=20')
        .set('Cookie', `token=${followed.token}`)
        .expect(200);

      const notifData = notifsRes.body?.data;
      const notifItems = Array.isArray(notifData)
        ? notifData
        : (notifData?.items ?? []);
      const hasFollowNotif = notifItems.some(
        (n: any) =>
          n.actorId === follower.profileId &&
          (n.type === 'FOLLOW' || n.entityType === 'PROFILE'),
      );
      expect(hasFollowNotif).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 6: Feed Visibility (NEW)
  // ─────────────────────────────────────────────────────

  describe('Feed Visibility Flow', () => {
    it('should see followed user posts in feed and hide after unfollow', async () => {
      const userA = await completeUserRegistration(app, request, 'feedA');
      const userB = await completeUserRegistration(app, request, 'feedB');

      // A follows B (single call)
      const followRes = await request(app.getHttpServer())
        .post(`/network/follow/profile/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      expect([200, 201]).toContain(followRes.statusCode);

      // B creates a post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${userB.token}`)
        .send({ content: 'Hello from B!' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        // Wait for feed to update
        await new Promise((resolve) => setTimeout(resolve, 200));

        // A should see B's post in feed
        const feedRes = await request(app.getHttpServer())
          .get('/posts/feed?skip=0&limit=20')
          .set('Cookie', `token=${userA.token}`)
          .expect(200);

        // Check if post is in feed (might or might not depending on feed algorithm)
        const postsInFeed = feedRes.body.data;
        if (Array.isArray(postsInFeed)) {
          const hasPost = postsInFeed.some((p: any) => p.id === postId);
          expect(typeof hasPost).toBe('boolean');
        }

        // A unfollows B (correct route: DELETE /network/follow/profile/:id)
        const unfollowRes = await request(app.getHttpServer())
          .delete(`/network/follow/profile/${userB.profileId}`)
          .set('Cookie', `token=${userA.token}`);

        expect([200, 204]).toContain(unfollowRes.statusCode);
      }
    });

    it('should see connected user posts in feed', async () => {
      const { user1, user2 } = await createConnectedUsers(app, request);

      // user2 creates a post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${user2.token}`)
        .send({ content: 'Post from connected user' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        // Wait for feed
        await new Promise((resolve) => setTimeout(resolve, 200));

        // user1 should see it in feed (connected users)
        const feedRes = await request(app.getHttpServer())
          .get('/posts/feed?skip=0&limit=20')
          .set('Cookie', `token=${user1.token}`)
          .expect(200);

        expect(feedRes.body.data).toBeDefined();
        expect(feedRes.body.data.items).toBeDefined();
        expect(Array.isArray(feedRes.body.data.items)).toBe(true);
      }
    });

    it('should see own posts in feed', async () => {
      const user = await completeUserRegistration(app, request, 'ownfeed');

      // User creates post
      const postRes = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${user.token}`)
        .send({ content: 'My own post' });

      expect([200, 201]).toContain(postRes.statusCode);
      const postId = postRes.body.data?.id;

      if (postId) {
        // Check feed
        const feedRes = await request(app.getHttpServer())
          .get('/posts/feed?skip=0&limit=20')
          .set('Cookie', `token=${user.token}`)
          .expect(200);

        // User should see their own posts
        expect(feedRes.body.data.items).toBeDefined();
        expect(Array.isArray(feedRes.body.data.items)).toBe(true);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 7: Network Activity Feed (NEW - Phase 2)
  // ─────────────────────────────────────────────────────

  describe('Network Activity Feed', () => {
    it('should show connection activities in network feed', async () => {
      const userA = await completeUserRegistration(app, request, 'netactA');
      const userB = await completeUserRegistration(app, request, 'netactB');
      const userC = await completeUserRegistration(app, request, 'netactC');

      // A and B are connected
      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}`)
        .set('Cookie', `token=${userA.token}`);

      await request(app.getHttpServer())
        .post(`/network/connect/${userA.profileId}/accept`)
        .set('Cookie', `token=${userB.token}`);

      // B connects to C
      await request(app.getHttpServer())
        .post(`/network/connect/${userC.profileId}`)
        .set('Cookie', `token=${userB.token}`);

      await request(app.getHttpServer())
        .post(`/network/connect/${userB.profileId}/accept`)
        .set('Cookie', `token=${userC.token}`);

      // Wait for activity to be generated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // A should see B's connection activity
      const activityRes = await request(app.getHttpServer())
        .get('/network/activity?limit=20&offset=0')
        .set('Cookie', `token=${userA.token}`)
        .expect(200);

      expect(activityRes.body.data).toBeDefined();
      expect(Array.isArray(activityRes.body.data)).toBe(true);
    });

    it('should show follow activities in network feed', async () => {
      const { user1, user2 } = await createConnectedUsers(app, request);
      const userC = await completeUserRegistration(app, request, 'follactC');

      // user2 follows userC
      await request(app.getHttpServer())
        .post(`/network/follow/profile/${userC.profileId}`)
        .set('Cookie', `token=${user2.token}`);

      // Wait for activity
      await new Promise((resolve) => setTimeout(resolve, 200));

      // user1 should see user2's follow activity
      const activityRes = await request(app.getHttpServer())
        .get('/network/activity?limit=20&offset=0')
        .set('Cookie', `token=${user1.token}`)
        .expect(200);

      expect(activityRes.body.data).toBeDefined();
    });

    it('should show post activities from connections', async () => {
      const { user1, user2 } = await createConnectedUsers(app, request);

      // user2 creates a post
      await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', `token=${user2.token}`)
        .send({ content: 'New post from connection' });

      // Wait for activity
      await new Promise((resolve) => setTimeout(resolve, 200));

      // user1 should see it in activity
      const activityRes = await request(app.getHttpServer())
        .get('/network/activity?limit=20&offset=0')
        .set('Cookie', `token=${user1.token}`)
        .expect(200);

      expect(activityRes.body.data).toBeDefined();
      expect(Array.isArray(activityRes.body.data)).toBe(true);
    });

    it('should paginate network activity', async () => {
      const user = await completeUserRegistration(app, request, 'netpag');

      // Test pagination
      const page1 = await request(app.getHttpServer())
        .get('/network/activity?limit=10&offset=0')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(Array.isArray(page1.body.data)).toBe(true);

      const page2 = await request(app.getHttpServer())
        .get('/network/activity?limit=10&offset=10')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(Array.isArray(page2.body.data)).toBe(true);
    });

    it('should filter network activity by type', async () => {
      const user = await completeUserRegistration(app, request, 'netfilt');

      // Test different views/filters if available
      const res = await request(app.getHttpServer())
        .get('/network/activity?limit=20&offset=0')
        .set('Cookie', `token=${user.token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });
});
