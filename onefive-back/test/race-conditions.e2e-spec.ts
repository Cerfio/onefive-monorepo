/**
 * Race conditions critiques. Le but n'est pas une vraie injection de
 * concurrence (Postgres + Promise.all suffit en local), mais de prouver
 * que les invariants atomiques tiennent même quand 2 opérations sont
 * lancées en parallèle.
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
  createUniqueEmail,
  createUserInWaitlist,
  ensureBadgesSeeded,
  signupWithReferralAndComplete,
  validPassword,
} from './helpers/fixtures';
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import { emailsSentTo, hasBadge, waitlistStatusFor } from './helpers/assertions';

describe('Race conditions', () => {
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

  it('FOUNDING_MEMBER race: two concurrent activations fire only one email + one badge', async () => {
    const parrain = await createUserInWaitlist(app, request, 'race-parrain');
    const { referralCode } = await prisma.profile.findUniqueOrThrow({
      where: { id: parrain.profileId },
      select: { referralCode: true },
    });

    // Get to 9 accepted referrals
    for (let i = 0; i < 9; i++) {
      await signupWithReferralAndComplete(app, request, referralCode, `race-f${i}`);
    }
    expect(await waitlistStatusFor(prisma, parrain.profileId)).toBe('WAITING');

    // 10th referral done synchronously (this triggers checkFoundingMember)
    await signupWithReferralAndComplete(app, request, referralCode, 'race-f9');

    resetMocks(mocks);

    // Now fire two concurrent direct calls to checkFoundingMember (simulates
    // two requests arriving simultaneously after the threshold has been
    // crossed). The transactional WHERE waitlistStatus='WAITING' must keep
    // exactly one activation event.
    await Promise.all([
      waitlist.checkFoundingMember(parrain.profileId),
      waitlist.checkFoundingMember(parrain.profileId),
      waitlist.checkFoundingMember(parrain.profileId),
    ]);

    // No additional founding-member email
    expect(emailsSentTo(mocks, parrain.email, 'founding-member')).toHaveLength(0);

    // Exactly one badge row
    const badges = await prisma.userBadge.findMany({
      where: { profileId: parrain.profileId, badge: { type: 'FOUNDING_MEMBER' as any } },
    });
    expect(badges).toHaveLength(1);

    expect(await waitlistStatusFor(prisma, parrain.profileId)).toBe('ACTIVE');
  });

  it('signup race: two parallel signups with the same email — exactly one User row created', async () => {
    const email = createUniqueEmail('signup-race');

    const [r1, r2] = await Promise.allSettled([
      request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword }),
      request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: validPassword }),
    ]);

    // At least one succeeded with 201 (the first; the second sees an existing
    // user and returns 200/201 with the security email branch).
    const ok = [r1, r2].filter(
      (r) => r.status === 'fulfilled' && [200, 201].includes((r.value as any).status),
    );
    expect(ok.length).toBeGreaterThanOrEqual(1);

    // Exactly one User row (Prisma unique constraint enforces this regardless of races)
    const users = await prisma.user.findMany({
      where: { email: email.toLowerCase() },
    });
    expect(users).toHaveLength(1);
  });

  it('reaction race: two concurrent reactions of the same type by the same user → one PostReaction row', async () => {
    const author = await createAuthenticatedUser(app, request, 'react-race-author');
    const reactor = await createAuthenticatedUser(app, request, 'react-race-reactor');

    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${author.token}`)
      .send({ content: 'hello', tags: [] });
    const postId = postRes.body.data.id;

    const url = `/post-reactions/posts/${postId}`;
    await Promise.allSettled([
      request(app.getHttpServer())
        .post(url)
        .set('Cookie', `token=${reactor.token}`)
        .send({ reaction: 'THUMBS_UP' }),
      request(app.getHttpServer())
        .post(url)
        .set('Cookie', `token=${reactor.token}`)
        .send({ reaction: 'THUMBS_UP' }),
    ]);

    const reactions = await prisma.postReaction.findMany({
      where: { postId, profileId: reactor.profileId },
    });
    // The unique constraint (postId, profileId) must keep this at 1
    expect(reactions).toHaveLength(1);
  });
});
