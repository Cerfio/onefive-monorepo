import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from './waitlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationHelperService } from '../notification/notification-helper.service';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let prisma: any;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    startAction: jest.fn().mockReturnValue({ transactionId: 'test-tx' }),
    endAction: jest.fn(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      profile: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      referral: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      referralStats: {
        upsert: jest.fn(),
      },
      badge: {
        findUnique: jest.fn(),
      },
      userBadge: {
        upsert: jest.fn(),
      },
      // Interactive transaction: callback receives the same mock prisma instance
      $transaction: jest.fn((cb: (tx: any) => Promise<any>) => cb(mockPrisma)),
    };

    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationHelper = {
      notify: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
        { provide: NotificationHelperService, useValue: mockNotificationHelper },
        { provide: 'Logger', useValue: mockLogger },
      ],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('processNewProfile - email verification check', () => {
    const referrerProfile = {
      id: 'referrer-1',
      referralCode: 'REF123',
      isAmbassador: false,
    };

    it('should set referral status to PENDING when email is NOT verified', async () => {
      prisma.profile.findUnique.mockResolvedValue(referrerProfile);
      prisma.referral.upsert.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({});

      await service.processNewProfile(
        'profile-1',
        'user@test.com',
        'REF123',
        false, // isEmailVerified = false
      );

      expect(prisma.referral.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            status: 'PENDING',
            acceptedAt: null,
          }),
          create: expect.objectContaining({
            status: 'PENDING',
            acceptedAt: null,
          }),
        }),
      );
    });

    it('should set referral status to ACCEPTED when email IS verified', async () => {
      prisma.profile.findUnique.mockResolvedValue(referrerProfile);
      prisma.referral.upsert.mockResolvedValue({});
      prisma.referral.count.mockResolvedValue(1);
      prisma.referralStats.upsert.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({});

      await service.processNewProfile(
        'profile-1',
        'user@test.com',
        'REF123',
        true, // isEmailVerified = true
      );

      expect(prisma.referral.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ status: 'ACCEPTED' }),
          create: expect.objectContaining({ status: 'ACCEPTED' }),
        }),
      );
    });

    it('should NOT call checkFoundingMember when email is NOT verified', async () => {
      prisma.profile.findUnique.mockResolvedValue(referrerProfile);
      prisma.referral.upsert.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({});

      await service.processNewProfile(
        'profile-1',
        'user@test.com',
        'REF123',
        false,
      );

      // checkFoundingMember calls prisma.referral.count — should NOT be called
      expect(prisma.referral.count).not.toHaveBeenCalled();
      expect(prisma.referralStats.upsert).not.toHaveBeenCalled();
    });

    it('should call checkFoundingMember when email IS verified', async () => {
      prisma.profile.findUnique.mockResolvedValue(referrerProfile);
      prisma.referral.upsert.mockResolvedValue({});
      prisma.referral.count.mockResolvedValue(5); // not enough for founding member
      prisma.referralStats.upsert.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({});

      await service.processNewProfile(
        'profile-1',
        'user@test.com',
        'REF123',
        true,
      );

      // checkFoundingMember calls prisma.referral.count
      expect(prisma.referral.count).toHaveBeenCalled();
      // updateTier calls prisma.referralStats.upsert
      expect(prisma.referralStats.upsert).toHaveBeenCalled();
    });
  });

  describe('acceptPendingReferralOnEmailVerification', () => {
    it('should do nothing if profile not found', async () => {
      prisma.profile.findFirst.mockResolvedValue(null);

      await service.acceptPendingReferralOnEmailVerification('user-1');

      expect(prisma.referral.findFirst).not.toHaveBeenCalled();
    });

    it('should do nothing if profile has no referrer', async () => {
      prisma.profile.findFirst.mockResolvedValue({
        id: 'profile-1',
        referrerId: null,
        waitlistStatus: 'WAITING',
      });

      await service.acceptPendingReferralOnEmailVerification('user-1');

      expect(prisma.referral.findFirst).not.toHaveBeenCalled();
    });

    it('should do nothing if no pending referral exists', async () => {
      prisma.profile.findFirst.mockResolvedValue({
        id: 'profile-1',
        referrerId: 'referrer-1',
        waitlistStatus: 'WAITING',
      });
      prisma.referral.findFirst.mockResolvedValue(null);

      await service.acceptPendingReferralOnEmailVerification('user-1');

      expect(prisma.referral.update).not.toHaveBeenCalled();
    });

    it('should accept pending referral and call checkFoundingMember + updateTier', async () => {
      prisma.profile.findFirst.mockResolvedValue({
        id: 'profile-1',
        referrerId: 'referrer-1',
        waitlistStatus: 'WAITING',
      });
      prisma.referral.findFirst.mockResolvedValue({
        id: 'referral-1',
        referrerId: 'referrer-1',
        invitedProfileId: 'profile-1',
        status: 'PENDING',
        referrer: { id: 'referrer-1', isAmbassador: false },
      });
      prisma.referral.update.mockResolvedValue({});
      prisma.referral.count.mockResolvedValue(5);
      prisma.referralStats.upsert.mockResolvedValue({});

      await service.acceptPendingReferralOnEmailVerification('user-1');

      // Referral status should be set to ACCEPTED
      expect(prisma.referral.update).toHaveBeenCalledWith({
        where: { id: 'referral-1' },
        data: { status: 'ACCEPTED', acceptedAt: expect.any(Date) },
      });
      // checkFoundingMember should be called
      expect(prisma.referral.count).toHaveBeenCalled();
      // updateTier should be called
      expect(prisma.referralStats.upsert).toHaveBeenCalled();
    });

    it('should activate profile if referrer is ambassador', async () => {
      prisma.profile.findFirst.mockResolvedValue({
        id: 'profile-1',
        referrerId: 'referrer-1',
        waitlistStatus: 'WAITING',
      });
      prisma.referral.findFirst.mockResolvedValue({
        id: 'referral-1',
        referrerId: 'referrer-1',
        invitedProfileId: 'profile-1',
        status: 'PENDING',
        referrer: { id: 'referrer-1', isAmbassador: true },
      });
      prisma.referral.update.mockResolvedValue({});
      prisma.referral.count.mockResolvedValue(1);
      prisma.referralStats.upsert.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({});

      await service.acceptPendingReferralOnEmailVerification('user-1');

      // Profile should be activated
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'profile-1' },
        data: {
          waitlistStatus: 'ACTIVE',
          activatedAt: expect.any(Date),
        },
      });
    });

    it('should NOT activate profile if referrer is not ambassador', async () => {
      prisma.profile.findFirst.mockResolvedValue({
        id: 'profile-1',
        referrerId: 'referrer-1',
        waitlistStatus: 'WAITING',
      });
      prisma.referral.findFirst.mockResolvedValue({
        id: 'referral-1',
        referrerId: 'referrer-1',
        invitedProfileId: 'profile-1',
        status: 'PENDING',
        referrer: { id: 'referrer-1', isAmbassador: false },
      });
      prisma.referral.update.mockResolvedValue({});
      prisma.referral.count.mockResolvedValue(5);
      prisma.referralStats.upsert.mockResolvedValue({});

      await service.acceptPendingReferralOnEmailVerification('user-1');

      // Profile should NOT be updated (no activation)
      expect(prisma.profile.update).not.toHaveBeenCalled();
    });
  });

  describe('checkFoundingMember - race condition prevention', () => {
    it('should use a transaction for atomicity', async () => {
      prisma.referral.count.mockResolvedValue(5); // not enough

      await service.checkFoundingMember('referrer-1');

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not activate if fewer than 10 accepted referrals', async () => {
      prisma.referral.count.mockResolvedValue(9);

      await service.checkFoundingMember('referrer-1');

      expect(prisma.profile.updateMany).not.toHaveBeenCalled();
      expect(prisma.badge.findUnique).not.toHaveBeenCalled();
    });

    it('should atomically activate only if still WAITING (updateMany with condition)', async () => {
      prisma.referral.count.mockResolvedValue(10);
      prisma.profile.updateMany.mockResolvedValue({ count: 1 });
      prisma.badge.findUnique.mockResolvedValue({
        id: 'badge-1',
        type: 'FOUNDING_MEMBER',
      });
      prisma.userBadge.upsert.mockResolvedValue({});
      prisma.profile.findUnique.mockResolvedValue({
        firstName: 'Alice',
        user: { email: 'alice@test.com' },
      });

      await service.checkFoundingMember('referrer-1');

      // Should use updateMany with waitlistStatus condition for atomicity
      expect(prisma.profile.updateMany).toHaveBeenCalledWith({
        where: { id: 'referrer-1', waitlistStatus: 'WAITING' },
        data: { waitlistStatus: 'ACTIVE', activatedAt: expect.any(Date) },
      });
    });

    it('should send email only when profile was just activated', async () => {
      prisma.referral.count.mockResolvedValue(12);
      prisma.profile.updateMany.mockResolvedValue({ count: 1 }); // activated
      prisma.badge.findUnique.mockResolvedValue({
        id: 'badge-1',
        type: 'FOUNDING_MEMBER',
      });
      prisma.userBadge.upsert.mockResolvedValue({});
      prisma.profile.findUnique.mockResolvedValue({
        firstName: 'Alice',
        user: { email: 'alice@test.com' },
      });

      const emailService = (service as any).emailService;

      await service.checkFoundingMember('referrer-1');

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@test.com',
          type: 'founding-member',
        }),
      );
    });

    it('should NOT send email when profile was already active (race condition loser)', async () => {
      prisma.referral.count.mockResolvedValue(10);
      prisma.profile.updateMany.mockResolvedValue({ count: 0 }); // already active — race lost
      prisma.badge.findUnique.mockResolvedValue({
        id: 'badge-1',
        type: 'FOUNDING_MEMBER',
      });
      prisma.userBadge.upsert.mockResolvedValue({});

      const emailService = (service as any).emailService;

      await service.checkFoundingMember('referrer-1');

      // Email should NOT be sent — profile was already activated by the other request
      expect(emailService.sendEmail).not.toHaveBeenCalled();
      // Profile should NOT be fetched for email purposes
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should still award badge even if profile was already active', async () => {
      prisma.referral.count.mockResolvedValue(10);
      prisma.profile.updateMany.mockResolvedValue({ count: 0 }); // already active
      prisma.badge.findUnique.mockResolvedValue({
        id: 'badge-1',
        type: 'FOUNDING_MEMBER',
      });
      prisma.userBadge.upsert.mockResolvedValue({});

      await service.checkFoundingMember('referrer-1');

      // Badge upsert is idempotent — should still be called
      expect(prisma.userBadge.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            profileId_badgeId: { profileId: 'referrer-1', badgeId: 'badge-1' },
          },
        }),
      );
    });
  });
});
