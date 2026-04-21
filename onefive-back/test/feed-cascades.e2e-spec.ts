/**
 * Cascades déclenchées par les interactions feed : like, comment, reply, repost.
 * Chaque scénario asserts la notification créée côté destinataire (ou l'absence
 * en cas de self-action).
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
import { notificationsFor, posthogEventsFor, waitForNotifications } from './helpers/assertions';

describe('Feed cascades — posts / reactions / comments / replies / repost', () => {
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

  async function createPost(token: string, content = 'hello world') {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send({ content, tags: [] })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    return res.body.data.id as string;
  }

  async function react(token: string, postId: string, reaction = 'THUMBS_UP') {
    await request(app.getHttpServer())
      .post(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ reaction })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
  }

  async function comment(token: string, postId: string, content: string, parentId?: string) {
    const res = await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${token}`)
      .send({ content, ...(parentId ? { parentId } : {}) })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    return res.body?.data?.id as string | undefined;
  }

  it('like cascade: A likes B post → LIKE notification to B, PostHog event', async () => {
    const author = await createAuthenticatedUser(app, request, 'author-like');
    const liker = await createAuthenticatedUser(app, request, 'liker');
    const postId = await createPost(author.token);

    await react(liker.token, postId, 'THUMBS_UP');

    const notifs = await notificationsFor(prisma, author.profileId, 'LIKE');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].actorId).toBe(liker.profileId);
    expect(notifs[0].entityId).toBe(postId);
    expect(notifs[0].entityType).toBe('POST');

    const events = posthogEventsFor(mocks, 'post_reaction_created');
    expect(events).toHaveLength(1);
  });

  it('no self-notification: A likes own post → no LIKE notif', async () => {
    const a = await createAuthenticatedUser(app, request, 'author-self');
    const postId = await createPost(a.token);

    await react(a.token, postId, 'HEART');

    const notifs = await notificationsFor(prisma, a.profileId, 'LIKE');
    expect(notifs).toHaveLength(0);
  });

  it('comment cascade: A comments B post → COMMENT notif to B', async () => {
    const author = await createAuthenticatedUser(app, request, 'author-cm');
    const commenter = await createAuthenticatedUser(app, request, 'commenter');
    const postId = await createPost(author.token);

    await comment(commenter.token, postId, 'nice post');

    const notifs = await notificationsFor(prisma, author.profileId, 'COMMENT');
    expect(notifs).toHaveLength(1);
    expect(notifs[0].actorId).toBe(commenter.profileId);
  });

  it('reply fan-out: A replies to B comment on C post → COMMENT_REPLY to B + COMMENT to C (different types)', async () => {
    const postAuthor = await createAuthenticatedUser(app, request, 'post-author');
    const commentAuthor = await createAuthenticatedUser(app, request, 'parent-commenter');
    const replier = await createAuthenticatedUser(app, request, 'replier');

    const postId = await createPost(postAuthor.token);
    const parentCommentId = await comment(commentAuthor.token, postId, 'top-level');
    expect(parentCommentId).toBeTruthy();

    // post author already got a COMMENT notif from the top-level comment;
    // reset so we only observe the reply cascade.
    await prisma.notification.deleteMany({});

    await comment(replier.token, postId, 'my reply', parentCommentId);

    // Post author receives COMMENT (for the reply which is still a comment on their post)
    const postAuthorNotifs = await notificationsFor(prisma, postAuthor.profileId, 'COMMENT');
    expect(postAuthorNotifs).toHaveLength(1);

    // Parent comment author receives COMMENT_REPLY
    const parentNotifs = await notificationsFor(
      prisma,
      commentAuthor.profileId,
      'COMMENT_REPLY',
    );
    expect(parentNotifs).toHaveLength(1);
    expect(parentNotifs[0].actorId).toBe(replier.profileId);

    // Replier receives nothing (no self-notif)
    const selfNotifs = await notificationsFor(prisma, replier.profileId);
    expect(selfNotifs).toHaveLength(0);
  });

  it('repost cascade: A reposts B post → SHARE notif to B, post_reposted event', async () => {
    const author = await createAuthenticatedUser(app, request, 'author-rp');
    const reposter = await createAuthenticatedUser(app, request, 'reposter');
    const postId = await createPost(author.token, 'original content');

    await request(app.getHttpServer())
      .post(`/posts/${postId}/repost`)
      .set('Cookie', `token=${reposter.token}`)
      .send({ content: 'love this' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });

    // Repost handler fires notifyPostRepost async (fire-and-forget) — poll.
    const notifs = await waitForNotifications(prisma, author.profileId, 'SHARE', 1);
    expect(notifs).toHaveLength(1);
    expect(notifs[0].actorId).toBe(reposter.profileId);

    expect(posthogEventsFor(mocks, 'post_reposted')).toHaveLength(1);
  });

  it('no external emails are sent on feed interactions (defence-in-depth)', async () => {
    const author = await createAuthenticatedUser(app, request, 'author-noemail');
    const liker = await createAuthenticatedUser(app, request, 'liker-noemail');
    const postId = await createPost(author.token);

    resetMocks(mocks); // ignore signup/profile-creation transactional side effects
    await react(liker.token, postId, 'HEART');
    await comment(liker.token, postId, 'nice');

    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.sms).not.toHaveBeenCalled();
    expect(mocks.discord).not.toHaveBeenCalled();
  });
});
