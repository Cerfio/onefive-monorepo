/**
 * PILOT TEST — validates the test pattern for cascading side effects.
 *
 * Covers the hero moment of the launch: when a referrer's 10th referral is
 * accepted, they should be activated from the waitlist, awarded the
 * FOUNDING_MEMBER badge, receive a congratulations email, and accumulate one
 * REFERRAL_ACCEPTED notification per accepted referral.
 *
 * Why this test matters: a silent regression here kills the whole growth loop
 * without any visible error.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import {
  createUserInWaitlist,
  ensureBadgesSeeded,
  signupWithReferralAndComplete,
} from './helpers/fixtures';
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import {
  emailsSentTo,
  hasBadge,
  waitlistStatusFor,
  acceptedReferralsCount,
  notificationsFor,
} from './helpers/assertions';

describe('Referral flow C — 10 accepted refs → FOUNDING_MEMBER', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);
    await ensureBadgesSeeded(prisma);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => {
    resetMocks(mocks);
  });

  it('activates the referrer + awards FOUNDING_MEMBER + sends congrats email on the 10th accepted referral', async () => {
    // Arrange: parrain is WAITING with no referrals yet.
    const parrain = await createUserInWaitlist(app, request, 'parrain');
    const { referralCode } = await prisma.profile.findUniqueOrThrow({
      where: { id: parrain.profileId },
      select: { referralCode: true },
    });

    expect(await waitlistStatusFor(prisma, parrain.profileId)).toBe('WAITING');
    expect(await hasBadge(prisma, parrain.profileId, 'FOUNDING_MEMBER')).toBe(false);

    // Act: 9 filleuls sign up with parrain's code — still below threshold.
    for (let i = 0; i < 9; i++) {
      await signupWithReferralAndComplete(app, request, referralCode, `filleul${i}`);
    }

    // Assert: 9 accepted, parrain still WAITING, no badge, no email.
    expect(await acceptedReferralsCount(prisma, parrain.profileId)).toBe(9);
    expect(await waitlistStatusFor(prisma, parrain.profileId)).toBe('WAITING');
    expect(await hasBadge(prisma, parrain.profileId, 'FOUNDING_MEMBER')).toBe(false);
    expect(emailsSentTo(mocks, parrain.email, 'founding-member')).toHaveLength(0);

    // Act: 10th filleul triggers the cascade.
    await signupWithReferralAndComplete(app, request, referralCode, 'filleul9');

    // Assert on the full side-effect cascade.
    expect(await acceptedReferralsCount(prisma, parrain.profileId)).toBe(10);
    expect(await waitlistStatusFor(prisma, parrain.profileId)).toBe('ACTIVE');
    expect(await hasBadge(prisma, parrain.profileId, 'FOUNDING_MEMBER')).toBe(true);

    const congratsEmails = emailsSentTo(mocks, parrain.email, 'founding-member');
    expect(congratsEmails).toHaveLength(1);
    expect(congratsEmails[0].payload).toMatchObject({
      firstName: expect.any(String),
      referralCount: 10,
    });

    // Each accepted referral fires one REFERRAL_ACCEPTED notification to the parrain.
    const notifs = await notificationsFor(
      prisma,
      parrain.profileId,
      'REFERRAL_ACCEPTED',
    );
    expect(notifs).toHaveLength(10);
  });

  it('is idempotent: the 11th referral does NOT re-send the email or re-award the badge', async () => {
    // Re-run the cascade then add one more — the transactional updateMany with
    // waitlistStatus:'WAITING' ensures only one activation + email even under races.
    const parrain = await createUserInWaitlist(app, request, 'parrain2');
    const { referralCode } = await prisma.profile.findUniqueOrThrow({
      where: { id: parrain.profileId },
      select: { referralCode: true },
    });

    for (let i = 0; i < 10; i++) {
      await signupWithReferralAndComplete(app, request, referralCode, `filleul2-${i}`);
    }
    // Reset after the activation wave so we only count post-activation effects.
    resetMocks(mocks);

    await signupWithReferralAndComplete(app, request, referralCode, 'filleul2-10');

    expect(emailsSentTo(mocks, parrain.email, 'founding-member')).toHaveLength(0);
    // Badge count stays at 1 — upsert is idempotent.
    const badges = await prisma.userBadge.findMany({
      where: { profileId: parrain.profileId, badge: { type: 'FOUNDING_MEMBER' as any } },
    });
    expect(badges).toHaveLength(1);
  });
});
