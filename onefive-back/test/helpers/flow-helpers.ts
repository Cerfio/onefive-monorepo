/**
 * Flow helpers for E2E tests
 *
 * Higher-level helpers that compose multiple API calls to set up
 * common scenarios. They all rely on the primitives from fixtures.ts.
 *
 * Convention:
 *   - Every helper takes (app, request) as first two args
 *   - Auth is via Cookie: `token=${token}`
 *   - Returns typed result objects for easy destructuring
 */

import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createAuthenticatedUser,
  createExperienceData,
  createEducationData,
  createStartupData,
  createProfileData,
  createPostData,
  createDiscussionData,
  validPassword,
  createUniqueEmail,
  extractAuthTokenFromResponse,
} from './fixtures';

// ─── Types ──────────────────────────────────────────────

export type AuthenticatedUser = {
  token: string;
  email: string;
  profileId: string;
  userId: string;
};

export type StartupResult = {
  startupId: string;
  founder1: AuthenticatedUser;
  founder2: AuthenticatedUser;
};

export type PostWithInteractions = {
  author: AuthenticatedUser;
  postId: string;
  liker: AuthenticatedUser;
  commenter: AuthenticatedUser;
};

export type ConversationResult = {
  user1: AuthenticatedUser;
  user2: AuthenticatedUser;
  conversationId: string;
};

export type DiscussionResult = {
  author: AuthenticatedUser;
  discussionId: string;
  answerer: AuthenticatedUser;
};

// ─── User & Profile ────────────────────────────────────

/**
 * Create a user with profile + experience + education (complete onboarding).
 */
export async function completeUserRegistration(
  app: INestApplication,
  request: any,
  prefix = 'complete',
): Promise<AuthenticatedUser> {
  const user = await createAuthenticatedUser(app, request, prefix);

  // Add experience
  await request(app.getHttpServer())
    .post('/experience')
    .set('Cookie', `token=${user.token}`)
    .send(createExperienceData());

  // Add education
  await request(app.getHttpServer())
    .post('/education')
    .set('Cookie', `token=${user.token}`)
    .send(createEducationData());

  // Ensure UserSettings record exists (auto-created by GET)
  await request(app.getHttpServer())
    .get('/user-settings')
    .set('Cookie', `token=${user.token}`);

  return user;
}

/**
 * Create a user with a custom profile (merged overrides).
 */
export async function createUserWithCustomProfile(
  app: INestApplication,
  request: any,
  profileOverrides: Record<string, any> = {},
  prefix = 'custom',
): Promise<AuthenticatedUser> {
  const email = createUniqueEmail(prefix);

  const signupRes = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: validPassword })
    .expect(201);

  const token: string = extractAuthTokenFromResponse(signupRes);

  const prisma = app.get(PrismaService);
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  await request(app.getHttpServer())
    .post('/profile')
    .set('Cookie', `token=${token}`)
    .send(createProfileData(profileOverrides))
    .expect(201);

  const selfRes = await request(app.getHttpServer())
    .get('/profile/self')
    .set('Cookie', `token=${token}`)
    .expect(200);

  return {
    token,
    email,
    profileId: selfRes.body.data.id,
    userId: selfRes.body.data.userId ?? '',
  };
}

// ─── Startup ───────────────────────────────────────────

/**
 * Create a startup with two founders.
 * Returns the startup ID and both authenticated founders.
 */
export async function createStartupWithFounders(
  app: INestApplication,
  request: any,
): Promise<StartupResult> {
  const founder1 = await createAuthenticatedUser(app, request, 'founder1');
  const founder2 = await createAuthenticatedUser(app, request, 'founder2');

  // Create startup as founder1
  const startupRes = await request(app.getHttpServer())
    .post('/startup')
    .set('Cookie', `token=${founder1.token}`)
    .send(createStartupData());

  const startupId: string = startupRes.body.data?.id;

  // Add founder2
  if (startupId) {
    await request(app.getHttpServer())
      .post(`/startup/${startupId}/founders`)
      .set('Cookie', `token=${founder1.token}`)
      .send({
        profileId: founder2.profileId,
        position: 'CTO',
        equity: 0,
      });
  }

  return { startupId, founder1, founder2 };
}

/**
 * Create a startup with funding info pre-populated.
 */
export async function createFundableStartup(
  app: INestApplication,
  request: any,
): Promise<{ startupId: string; founder: AuthenticatedUser }> {
  const founder = await createAuthenticatedUser(app, request, 'fundfounder');

  const startupRes = await request(app.getHttpServer())
    .post('/startup')
    .set('Cookie', `token=${founder.token}`)
    .send(createStartupData());

  const startupId: string = startupRes.body.data?.id;

  if (startupId) {
    await request(app.getHttpServer())
      .put(`/startup/${startupId}/funding`)
      .set('Cookie', `token=${founder.token}`)
      .send({
        totalRaised: '100000',
        lastRound: 'Seed',
        investors: ['Business Angel'],
        fundraisingType: 'none',
      });
  }

  return { startupId, founder };
}

// ─── Social / Network ──────────────────────────────────

/**
 * Create two users who are connected (connection request + accept).
 */
export async function createConnectedUsers(
  app: INestApplication,
  request: any,
): Promise<{ user1: AuthenticatedUser; user2: AuthenticatedUser }> {
  const user1 = await createAuthenticatedUser(app, request, 'connect1');
  const user2 = await createAuthenticatedUser(app, request, 'connect2');

  // user1 sends connection request to user2
  await request(app.getHttpServer())
    .post(`/network/connect/${user2.profileId}`)
    .set('Cookie', `token=${user1.token}`);

  // user2 accepts connection from user1
  await request(app.getHttpServer())
    .post(`/network/connect/${user1.profileId}/accept`)
    .set('Cookie', `token=${user2.token}`);

  return { user1, user2 };
}

/**
 * Create a post with a like and a comment from different users.
 */
export async function createPostWithInteractions(
  app: INestApplication,
  request: any,
): Promise<PostWithInteractions> {
  const author = await createAuthenticatedUser(app, request, 'author');

  // Create post
  const postRes = await request(app.getHttpServer())
    .post('/posts')
    .set('Cookie', `token=${author.token}`)
    .send({
      content: 'Test post for interactions',
      tags: ['test', 'e2e'],
    });

  const postId: string = postRes.body.data?.id;

  // Liker reacts
  const liker = await createAuthenticatedUser(app, request, 'liker');
  if (postId) {
    await request(app.getHttpServer())
      .post(`/post-reactions/posts/${postId}`)
      .set('Cookie', `token=${liker.token}`)
      .send({ reaction: 'HEART' });
  }

  // Commenter comments
  const commenter = await createAuthenticatedUser(app, request, 'commenter');
  if (postId) {
    await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${commenter.token}`)
      .send({ content: 'Great post!' });
  }

  return { author, postId, liker, commenter };
}

// ─── Messaging ─────────────────────────────────────────

/**
 * Create two connected users with a conversation and an initial message.
 */
export async function createConversationWithMessages(
  app: INestApplication,
  request: any,
): Promise<ConversationResult> {
  const { user1, user2 } = await createConnectedUsers(app, request);

  // Create conversation
  const convRes = await request(app.getHttpServer())
    .post('/messaging/conversations')
    .set('Cookie', `token=${user1.token}`)
    .send({ participantIds: [user2.profileId] });

  const conversationId: string = convRes.body.data?.id;

  // Send a message
  if (conversationId) {
    await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${user1.token}`)
      .send({ conversationId, content: 'Hello from user1!', type: 'TEXT' });
  }

  return { user1, user2, conversationId };
}

// ─── Discussion ────────────────────────────────────────

/**
 * Create a discussion with an answer from a different user.
 */
export async function createDiscussionWithAnswers(
  app: INestApplication,
  request: any,
): Promise<DiscussionResult> {
  const author = await createAuthenticatedUser(app, request, 'discauthor');

  // Create discussion
  const discRes = await request(app.getHttpServer())
    .post('/discussion')
    .set('Cookie', `token=${author.token}`)
    .send({
      question: 'What is the best way to validate an MVP?',
      content: 'Looking for advice on lean startup approaches.',
      tags: ['MVP', 'Validation'],
      type: 'DISCUSSION',
    });

  const discussionId: string = discRes.body.data?.id;

  // Another user answers
  const answerer = await createAuthenticatedUser(app, request, 'answerer');
  if (discussionId) {
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${answerer.token}`)
      .send({
        content: 'Start with customer interviews before building anything.',
      });
  }

  return { author, discussionId, answerer };
}

// ─── Auth Helpers ──────────────────────────────────────

/**
 * Sign up a raw user (no profile) — returns token and email.
 * Useful for testing the signup → profile creation flow.
 */
export async function signupRawUser(
  app: INestApplication,
  request: any,
  prefix = 'raw',
): Promise<{ token: string; email: string; userId: string }> {
  const email = createUniqueEmail(prefix);
  const signupRes = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: validPassword })
    .expect(201);

  return {
    token: extractAuthTokenFromResponse(signupRes),
    email,
    userId: signupRes.body.data.userId ?? '',
  };
}

/**
 * Sign in with email/password and return the token.
 */
export async function signinUser(
  app: INestApplication,
  request: any,
  email: string,
  password: string,
): Promise<{ token: string }> {
  const res = await request(app.getHttpServer())
    .post('/auth/signin')
    .send({ email, password })
    .expect(200);

  return { token: extractAuthTokenFromResponse(res) };
}

// ─── Startup (Complete) ────────────────────────────────

export type CompleteStartupResult = {
  startupId: string;
  founder: AuthenticatedUser;
  member: AuthenticatedUser;
  invitationId: string;
};

/**
 * Create a startup with funding, invite a member, and have them accept.
 */
export async function createCompleteStartup(
  app: INestApplication,
  request: any,
): Promise<CompleteStartupResult> {
  const founder = await completeUserRegistration(app, request, 'stfounder');
  const member = await completeUserRegistration(app, request, 'stmember');

  // Create startup
  const startupRes = await request(app.getHttpServer())
    .post('/startup')
    .set('Cookie', `token=${founder.token}`)
    .send(createStartupData());

  const startupId: string = startupRes.body.data?.id;

  // Add funding
  if (startupId) {
    await request(app.getHttpServer())
      .put(`/startup/${startupId}/funding`)
      .set('Cookie', `token=${founder.token}`)
      .send({
        totalRaised: '100000',
        lastRound: 'Seed',
        investors: ['Business Angel'],
        fundraisingType: 'none',
      });
  }

  // Invite member via startup invitation
  let invitationId = '';
  if (startupId) {
    await request(app.getHttpServer())
      .post('/startup/invite')
      .set('Cookie', `token=${founder.token}`)
      .send({
        profileId: member.profileId,
        position: 'Developer',
        equity: 0,
      });

    // Fetch invitations as member
    const invRes = await request(app.getHttpServer())
      .get('/startup/invitations')
      .set('Cookie', `token=${member.token}`);

    if (invRes.body.data?.length > 0) {
      invitationId = invRes.body.data[0].id;

      // Accept invitation
      await request(app.getHttpServer())
        .put(`/startup/invitations/${invitationId}/accept`)
        .set('Cookie', `token=${member.token}`);
    }
  }

  return { startupId, founder, member, invitationId };
}

// ─── Post Helpers ──────────────────────────────────────

/**
 * Create a single post and return its ID.
 */
export async function createPost(
  app: INestApplication,
  request: any,
  token: string,
  overrides: Record<string, any> = {},
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/posts')
    .set('Cookie', `token=${token}`)
    .send(createPostData(overrides));

  return res.body.data?.id;
}

// ─── Dataroom Helpers ──────────────────────────────────

/**
 * Create a startup (which auto-creates a dataroom), then fetch the dataroom.
 * Returns { dataroomId, startupId }.
 * When prisma is provided, uses direct DB lookup by startupId (more reliable).
 */
export async function createDataroomForUser(
  app: INestApplication,
  req: any,
  owner: { token: string; profileId: string },
  options?: { prisma?: { dataroom: { findFirst: (args: any) => Promise<{ id: string } | null> } } },
): Promise<{ dataroomId: string | undefined; startupId: string | undefined }> {
  const { createStartupData } = await import('./fixtures');
  const startupRes = await req(app.getHttpServer())
    .post('/startup')
    .set('Cookie', `token=${owner.token}`)
    .send(createStartupData());

  const startupId: string | undefined = startupRes.body.data?.id;

  if (!startupId) {
    return { dataroomId: undefined, startupId: undefined };
  }

  if (options?.prisma) {
    const dataroom = await options.prisma.dataroom.findFirst({
      where: { startupId },
      select: { id: true },
    });
    return { dataroomId: dataroom?.id, startupId };
  }

  const listRes = await req(app.getHttpServer())
    .get('/dataroom')
    .set('Cookie', `token=${owner.token}`);

  const datarooms = listRes.body.data?.items ?? [];
  const dataroom = Array.isArray(datarooms)
    ? datarooms.find((d: any) => d.startupId === startupId)
    : undefined;

  return { dataroomId: dataroom?.id, startupId };
}

// ─── Follow Helpers ────────────────────────────────────

/**
 * Follow a profile.
 */
export async function followProfile(
  app: INestApplication,
  request: any,
  token: string,
  targetProfileId: string,
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/network/follow/profile/${targetProfileId}`)
    .set('Cookie', `token=${token}`);
}

/**
 * Follow a startup.
 */
export async function followStartup(
  app: INestApplication,
  request: any,
  token: string,
  startupId: string,
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/network/follow/startup/${startupId}`)
    .set('Cookie', `token=${token}`);
}
