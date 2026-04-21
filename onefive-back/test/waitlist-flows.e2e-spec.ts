/**
 * Waitlist flows A (pas de ref) / B (ambassador code) / Admin activate.
 * Complète le flow C couvert par referral-founding-member.e2e-spec.ts.
 *
 * Note : create-profile.handler.ts force waitlistStatus=ACTIVE en NODE_ENV=test
 * pour simplifier la plupart des e2e. Ici on teste la logique elle-même via
 * waitlistService.processNewProfile / activateProfile pour bypasser ce hack.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { WaitlistService } from '../src/waitlist/waitlist.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createUserInWaitlist,
  ensureBadgesSeeded,
  makeProfileAmbassador,
} from './helpers/fixtures';
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import {
  emailsSentTo,
  hasBadge,
  waitlistStatusFor,
} from './helpers/assertions';

describe('Waitlist flows — A (no ref), B (ambassador), admin activate', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let waitlist: WaitlistService;
  let mocks: ExternalCallMocks;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    waitlist = app.get(WaitlistService);
    mocks = installMocks(app);
    await ensureBadgesSeeded(prisma);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => resetMocks(mocks));

  it('Flow A: processNewProfile without referral code → stays WAITING', async () => {
    const user = await createUserInWaitlist(app, request, 'flowA');
    // Re-run with no code; should not touch status
    await waitlist.processNewProfile(user.profileId, user.email, undefined, true);
    expect(await waitlistStatusFor(prisma, user.profileId)).toBe('WAITING');
    expect(emailsSentTo(mocks, user.email, 'account-activated')).toHaveLength(0);
  });

  it('Flow B: processNewProfile with ambassador code → ACTIVE immediately, no FOUNDING_MEMBER badge', async () => {
    const ambassador = await createAuthenticatedUser(app, request, 'amb');
    await makeProfileAmbassador(prisma, ambassador.profileId);
    const ambassadorProfile = await prisma.profile.findUniqueOrThrow({
      where: { id: ambassador.profileId },
      select: { referralCode: true },
    });

    const invitee = await createUserInWaitlist(app, request, 'flowB');
    await waitlist.processNewProfile(
      invitee.profileId,
      invitee.email,
      ambassadorProfile.referralCode,
      true,
    );

    expect(await waitlistStatusFor(prisma, invitee.profileId)).toBe('ACTIVE');

    // Ambassador must not gain a FOUNDING_MEMBER from this signup
    expect(await hasBadge(prisma, ambassador.profileId, 'FOUNDING_MEMBER')).toBe(false);
  });

  it('Admin activate: activateProfile → status ACTIVE + EARLY_ADOPTER badge + account-activated email', async () => {
    const target = await createUserInWaitlist(app, request, 'adminActivate');
    expect(await waitlistStatusFor(prisma, target.profileId)).toBe('WAITING');

    await waitlist.activateProfile(target.profileId);

    expect(await waitlistStatusFor(prisma, target.profileId)).toBe('ACTIVE');
    expect(await hasBadge(prisma, target.profileId, 'EARLY_ADOPTER')).toBe(true);

    const emails = emailsSentTo(mocks, target.email, 'account-activated');
    expect(emails).toHaveLength(1);
    expect(emails[0].payload).toMatchObject({
      firstName: expect.any(String),
      userEmail: target.email.toLowerCase(),
    });
  });

  it('Admin activate is idempotent: calling twice does not resend email', async () => {
    const target = await createUserInWaitlist(app, request, 'idempoActivate');
    await waitlist.activateProfile(target.profileId);
    resetMocks(mocks);

    await waitlist.activateProfile(target.profileId);

    // wasWaiting is now false → email gated
    expect(emailsSentTo(mocks, target.email, 'account-activated')).toHaveLength(0);
    expect(await waitlistStatusFor(prisma, target.profileId)).toBe('ACTIVE');
  });
});
