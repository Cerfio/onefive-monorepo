/**
 * Streak system — daily connection tracker.
 * - recordConnection: inserts a Streak row for today (409 if already exists)
 * - getCurrentStreak: counts consecutive days ending today or yesterday
 * - getCurrentStreakBatch: same for N users
 */
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { StreakService } from '../src/streak/streak.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import * as request from 'supertest';
import { createAuthenticatedUser } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Streak system', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let streak: StreakService;

  function utcDay(offset = 0): Date {
    const now = new Date();
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    day.setUTCDate(day.getUTCDate() + offset);
    return day;
  }

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    streak = app.get(StreakService);
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('recordConnection: creates a Streak row for today, second call same day → 409', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-rec');

    await streak.recordConnection({ transactionId: 't1', userId: u.userId });
    const rows = await prisma.streak.findMany({ where: { userId: u.userId } });
    expect(rows).toHaveLength(1);

    // Second call same day → 409 conflict
    await expect(
      streak.recordConnection({ transactionId: 't2', userId: u.userId }),
    ).rejects.toMatchObject({ code: 'STREAK_ALREADY_EXISTS' });
  });

  it('getCurrentStreak: 0 when no connection', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-empty');
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(0);
  });

  it('getCurrentStreak: 1 for today alone', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-1');
    await prisma.streak.create({ data: { userId: u.userId, date: utcDay(0) } });
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(1);
  });

  it('getCurrentStreak: 3 consecutive days ending today', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-3');
    await prisma.streak.createMany({
      data: [
        { userId: u.userId, date: utcDay(-2) },
        { userId: u.userId, date: utcDay(-1) },
        { userId: u.userId, date: utcDay(0) },
      ],
    });
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(3);
  });

  it('getCurrentStreak: keeps counting if user connected yesterday (today still valid window)', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-y');
    await prisma.streak.createMany({
      data: [
        { userId: u.userId, date: utcDay(-2) },
        { userId: u.userId, date: utcDay(-1) },
      ],
    });
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(2); // -1 + -2 consecutive, starting from yesterday
  });

  it('getCurrentStreak: resets to 0 when last connection is > 1 day ago', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-reset');
    await prisma.streak.create({ data: { userId: u.userId, date: utcDay(-3) } });
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(0);
  });

  it('getCurrentStreak: gap in consecutive days breaks the streak', async () => {
    const u = await createAuthenticatedUser(app, request, 'streak-gap');
    await prisma.streak.createMany({
      data: [
        { userId: u.userId, date: utcDay(-5) },
        { userId: u.userId, date: utcDay(-4) },
        // gap on day -3
        { userId: u.userId, date: utcDay(-1) },
        { userId: u.userId, date: utcDay(0) },
      ],
    });
    const s = await streak.getCurrentStreak({ transactionId: 't', userId: u.userId });
    expect(s).toBe(2); // only today + yesterday, not the earlier pair
  });

  it('getCurrentStreakBatch: returns a Map for N users in one query', async () => {
    const u1 = await createAuthenticatedUser(app, request, 'streak-b1');
    const u2 = await createAuthenticatedUser(app, request, 'streak-b2');
    const u3 = await createAuthenticatedUser(app, request, 'streak-b3');

    await prisma.streak.create({ data: { userId: u1.userId, date: utcDay(0) } });
    await prisma.streak.createMany({
      data: [
        { userId: u2.userId, date: utcDay(-1) },
        { userId: u2.userId, date: utcDay(0) },
      ],
    });
    // u3: nothing

    const map = await streak.getCurrentStreakBatch({
      transactionId: 't',
      userIds: [u1.userId, u2.userId, u3.userId],
    });
    expect(map.get(u1.userId)).toBe(1);
    expect(map.get(u2.userId)).toBe(2);
    expect(map.get(u3.userId) ?? 0).toBe(0);
  });
});
