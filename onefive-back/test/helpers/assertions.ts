/**
 * Side-effect inspection helpers.
 *
 * Each helper reads the captured state (from mocks or from the DB) and returns
 * it in a form easy to assert on. Keeps tests readable:
 *
 *     expect(emailsSentTo(mocks, parrain.email, 'founding-member')).toHaveLength(1);
 *     expect(await notificationsFor(prisma, parrain.profileId, 'REFERRAL_ACCEPTED')).toHaveLength(10);
 */
import type { PrismaService } from '../../src/prisma/prisma.service';
import type { ExternalCallMocks } from './mocks';

// ── Email assertions ──────────────────────────────────────

export type CapturedEmail = {
  to: string;
  type: string;
  payload: Record<string, unknown>;
};

export function emailsSent(mocks: ExternalCallMocks): CapturedEmail[] {
  return mocks.email.mock.calls.map(([arg]: [any]) => ({
    to: arg.to,
    type: arg.type,
    payload: arg.payload ?? {},
  }));
}

export function emailsSentTo(
  mocks: ExternalCallMocks,
  email: string,
  type?: string,
): CapturedEmail[] {
  return emailsSent(mocks).filter(
    (e) =>
      e.to.toLowerCase() === email.toLowerCase() && (!type || e.type === type),
  );
}

// ── SMS assertions ────────────────────────────────────────

export function smsSent(mocks: ExternalCallMocks) {
  return mocks.sms.mock.calls.map(([arg]: [any]) => ({
    to: arg.to,
    body: arg.body,
  }));
}

// ── Discord assertions ────────────────────────────────────

export function discordMessages(mocks: ExternalCallMocks) {
  return mocks.discord.mock.calls.map(([channel, payload]: [any, any]) => ({
    channel,
    payload,
  }));
}

// ── PostHog assertions ────────────────────────────────────

export function posthogEvents(mocks: ExternalCallMocks) {
  return mocks.posthog.mock.calls.map(
    ([distinctId, event, properties]: [string, string, any]) => ({
      distinctId,
      event,
      properties: properties ?? {},
    }),
  );
}

export function posthogEventsFor(mocks: ExternalCallMocks, event: string) {
  return posthogEvents(mocks).filter((e) => e.event === event);
}

// ── Notification assertions (DB-backed) ───────────────────

export async function notificationsFor(
  prisma: PrismaService,
  profileId: string,
  type?: string,
) {
  return prisma.notification.findMany({
    where: {
      profileId,
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function latestNotificationFor(
  prisma: PrismaService,
  profileId: string,
  type?: string,
) {
  return prisma.notification.findFirst({
    where: {
      profileId,
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Poll until at least `count` notifications of `type` exist for `profileId`,
 * or until timeout. Needed for fire-and-forget notifyXxx calls that aren't
 * awaited by their handler (e.g. create-repost.handler.ts) — the HTTP response
 * returns before the notification row is committed.
 */
export async function waitForNotifications(
  prisma: PrismaService,
  profileId: string,
  type: string,
  count = 1,
  timeoutMs = 2000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const notifs = await notificationsFor(prisma, profileId, type);
    if (notifs.length >= count) return notifs;
    await new Promise((r) => setTimeout(r, 50));
  }
  return notificationsFor(prisma, profileId, type);
}

// ── Badge assertions ──────────────────────────────────────

export async function badgesFor(prisma: PrismaService, profileId: string) {
  return prisma.userBadge.findMany({
    where: { profileId },
    include: { badge: true },
  });
}

export async function hasBadge(
  prisma: PrismaService,
  profileId: string,
  type: string,
): Promise<boolean> {
  const row = await prisma.userBadge.findFirst({
    where: {
      profileId,
      badge: { type: type as any },
    },
  });
  return !!row;
}

// ── Waitlist / Profile state ──────────────────────────────

export async function waitlistStatusFor(
  prisma: PrismaService,
  profileId: string,
): Promise<string> {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: profileId },
    select: { waitlistStatus: true },
  });
  return profile.waitlistStatus;
}

export async function acceptedReferralsCount(
  prisma: PrismaService,
  referrerProfileId: string,
): Promise<number> {
  return prisma.referral.count({
    where: { referrerId: referrerProfileId, status: 'ACCEPTED' },
  });
}
