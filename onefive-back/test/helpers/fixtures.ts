/**
 * Test fixtures for E2E tests
 */

import { PrismaService } from '../../src/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';

export const validPassword = 'Test123!@#'; // Has: lowercase, uppercase, digit, symbol

export const validSignupData = {
  email: 'test@example.com',
  password: validPassword,
};

export const validSigninData = {
  email: 'signin@example.com',
  password: validPassword,
};

export function createUniqueEmail(prefix: string = 'test'): string {
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${randomSuffix}@example.com`;
}

export function createSignupData(overrides?: Partial<typeof validSignupData>) {
  return {
    ...validSignupData,
    email: createUniqueEmail(),
    ...overrides,
  };
}

export const validProfileData = {
  city: 'Paris',
  countryCode: 'FR',
  dateOfBirth: '1990-01-01T00:00:00.000Z',
  firstName: 'John',
  lastName: 'Doe',
  gender: 'male',
  genderSalutationPreference: 0,
  ecosystemRoles: ['FOUNDER'],
};

export function createProfileData(
  overrides?: Partial<typeof validProfileData>,
) {
  return {
    ...validProfileData,
    ...overrides,
  };
}

// ── Experience ──────────────────────────────────────────
export const validExperienceData = {
  title: 'Software Engineer',
  company: 'Acme Corp',
  domain: 'Technology',
  city: 'Paris',
  from: '2022-01-01T00:00:00.000Z',
  to: '2023-12-31T00:00:00.000Z',
  description: 'Full-stack development with NestJS and React.',
  tags: ['TypeScript', 'NestJS', 'React'],
};

export function createExperienceData(
  overrides?: Partial<typeof validExperienceData>,
) {
  return { ...validExperienceData, ...overrides };
}

// ── Education ───────────────────────────────────────────
export const validEducationData = {
  school: 'University of Paris',
  degree: 'Master',
  city: 'Paris',
  from: '2018-09-01T00:00:00.000Z',
  to: '2020-06-30T00:00:00.000Z',
  description: 'Specialisation in AI and distributed systems.',
};

export function createEducationData(
  overrides?: Partial<typeof validEducationData>,
) {
  return { ...validEducationData, ...overrides };
}

// ── Startup ─────────────────────────────────────────────
export const validStartupData = {
  name: `TestStartup-${Date.now()}`,
  tagline: 'A test startup for E2E tests',
  description: 'A test startup for E2E testing purposes with NestJS.',
  foundedDate: '2023-01-01T00:00:00.000Z',
  countryCode: 'FR',
  city: 'Paris',
  categories: ['Technology', 'SaaS'],
  website: 'https://example.com',
};

export function createStartupData(
  overrides?: Partial<typeof validStartupData>,
) {
  return {
    ...validStartupData,
    name: `TestStartup-${Date.now()}`,
    ...overrides,
  };
}

// ── Discussion ──────────────────────────────────────────
export const validDiscussionData = {
  question: 'How to validate an MVP before launch?',
  content: 'Looking for lean startup approaches and real-world advice.',
  tags: ['MVP', 'Validation'],
  type: 'DISCUSSION' as const,
};

export function createDiscussionData(
  overrides?: Partial<typeof validDiscussionData>,
) {
  return { ...validDiscussionData, ...overrides };
}

// ── Post ────────────────────────────────────────────────
export const validPostData = {
  content: 'This is a test post content for E2E tests',
  tags: ['test', 'e2e'],
};

export function createPostData(overrides?: Partial<typeof validPostData>) {
  return { ...validPostData, ...overrides };
}

export function extractAuthTokenFromResponse(response: any): string {
  const bodyToken = response?.body?.data?.token;
  if (bodyToken) {
    return bodyToken;
  }

  const setCookieHeader = response?.headers?.['set-cookie'] as
    | string[]
    | undefined;
  if (!setCookieHeader || setCookieHeader.length === 0) {
    throw new Error('No auth token found in response body or set-cookie header');
  }

  const tokenCookie = setCookieHeader.find((cookie) =>
    cookie.startsWith('token='),
  );
  if (!tokenCookie) {
    throw new Error('No token cookie found in set-cookie header');
  }

  const tokenPair = tokenCookie.split(';')[0];
  const token = tokenPair.slice('token='.length);
  if (!token) {
    throw new Error('Token cookie is empty');
  }

  return token;
}

// ── Helper: create authenticated user with profile ──────
export async function createAuthenticatedUser(
  app: any,
  request: any,
  prefix = 'user',
) {
  const email = createUniqueEmail(prefix);
  const signupRes = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: validPassword })
    .expect(201);

  const token = extractAuthTokenFromResponse(signupRes);

  // Approve the profile in waitlist for tests
  const prisma = app.get ? app.get(PrismaService) : app.prisma;
  if (!prisma) {
    throw new Error('Prisma service not available in fixtures');
  }

  const session = await prisma.session.findUnique({
    where: { id: token },
    select: { userId: true },
  });
  const user =
    (session?.userId
      ? await prisma.user.findUnique({ where: { id: session.userId } })
      : null) ??
    (await prisma.user.findUnique({ where: { email: email.toLowerCase() } }));

  if (!user) {
    throw new Error(`Authenticated user not found for email ${email}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  await request(app.getHttpServer())
    .post('/profile')
    .set('Cookie', `token=${token}`)
    .send(createProfileData())
    .expect(201);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    throw new Error(`Profile not found after creation for user ${user.id}`);
  }
  await prisma.profile.update({
    where: { id: profile.id },
    data: { waitlistStatus: 'ACTIVE', activatedAt: new Date() },
  });

  const selfRes = await request(app.getHttpServer())
    .get('/profile/self')
    .set('Cookie', `token=${token}`)
    .expect(200);

  return { token, email, profileId: selfRes.body.data.id, userId: user.id };
}

/**
 * Create a user with profile in WAITING state (not activated in waitlist).
 * Use for testing waitlist guard: user can signup + create profile but cannot
 * access protected routes until waitlistStatus is ACTIVE.
 */
export async function createUserInWaitlist(
  app: any,
  request: any,
  prefix = 'waitlist',
): Promise<{ token: string; email: string; profileId: string; userId: string }> {
  const email = createUniqueEmail(prefix);
  const signupRes = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: validPassword })
    .expect(201);

  const token = extractAuthTokenFromResponse(signupRes);

  const prisma = app.get ? app.get(PrismaService) : app.prisma;
  if (!prisma) {
    throw new Error('Prisma service not available in fixtures');
  }

  const session = await prisma.session.findUnique({
    where: { id: token },
    select: { userId: true },
  });
  const user =
    (session?.userId
      ? await prisma.user.findUnique({ where: { id: session.userId } })
      : null) ??
    (await prisma.user.findUnique({ where: { email: email.toLowerCase() } }));

  if (!user) {
    throw new Error(`Authenticated user not found for email ${email}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  await request(app.getHttpServer())
    .post('/profile')
    .set('Cookie', `token=${token}`)
    .send(createProfileData())
    .expect(201);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    throw new Error(`Profile not found after creation for user ${user.id}`);
  }

  // Force WAITING status (create-profile handler sets ACTIVE in test mode)
  await prisma.profile.update({
    where: { id: profile.id },
    data: { waitlistStatus: 'WAITING', activatedAt: null },
  });

  return {
    token,
    email,
    profileId: profile.id,
    userId: user.id,
  };
}

/**
 * Helper to approve a user's profile in the waitlist
 * Use this after creating a profile manually (not via createAuthenticatedUser)
 */
export async function approveProfileInWaitlist(
  app: INestApplication,
  email: string,
): Promise<void> {
  const prisma = app.get(PrismaService);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    throw new Error(`Profile for user ${email} not found`);
  }
  await prisma.profile.update({
    where: { id: profile.id },
    data: { waitlistStatus: 'ACTIVE', activatedAt: new Date() },
  });
}
