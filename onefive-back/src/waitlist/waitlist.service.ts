import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REFERRAL_TIERS } from '../referral/referral.service';
import { EmailService } from '../email/email.service';
import { NotificationHelperService } from '../notification/notification-helper.service';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationHelper: NotificationHelperService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  /**
   * Process a newly created profile for waitlist logic:
   * - If referred by ambassador → ACTIVE immediately
   * - If referred by user → WAITING, create referral, check founding member
   * - If email-based referral exists → same logic
   * - Otherwise → WAITING
   */
  async processNewProfile(
    profileId: string,
    userEmail: string,
    referredByCode?: string,
    isEmailVerified: boolean = false,
  ): Promise<void> {
    // 1. Check code-based referral (from ?ref= URL param)
    if (referredByCode) {
      const referrerProfile = await this.prisma.profile.findUnique({
        where: { referralCode: referredByCode },
        select: {
          id: true,
          referralCode: true,
          isAmbassador: true,
        },
      });

      if (referrerProfile) {
        const isAmbassador = referrerProfile.isAmbassador;

        // Update profile with referrer info
        await this.prisma.profile.update({
          where: { id: profileId },
          data: {
            referrerId: referrerProfile.id,
            waitlistStatus: isAmbassador ? 'ACTIVE' : 'WAITING',
            activatedAt: isAmbassador ? new Date() : undefined,
          },
        });

        // Create or update Referral record for tracking
        // Only mark as ACCEPTED if email is verified — prevents waitlist bypass with fake accounts
        const referralStatus = isEmailVerified ? 'ACCEPTED' : 'PENDING';
        const referral = await this.prisma.referral.upsert({
          where: {
            referrerId_invitedEmail: {
              referrerId: referrerProfile.id,
              invitedEmail: userEmail.toLowerCase(),
            },
          },
          update: {
            status: referralStatus,
            invitedProfileId: profileId,
            acceptedAt: isEmailVerified ? new Date() : null,
          },
          create: {
            referrerId: referrerProfile.id,
            invitedEmail: userEmail.toLowerCase(),
            invitedProfileId: profileId,
            status: referralStatus,
            acceptedAt: isEmailVerified ? new Date() : null,
          },
        });

        if (isEmailVerified) {
          try {
            const invitedProfile = await this.prisma.profile.findUnique({
              where: { id: profileId },
              select: { firstName: true, lastName: true },
            });
            const invitedName =
              invitedProfile?.firstName && invitedProfile?.lastName
                ? `${invitedProfile.firstName} ${invitedProfile.lastName}`.trim()
                : 'Un utilisateur';

            await this.notificationHelper.notifyReferralAccepted({
              referrerProfileId: referrerProfile.id,
              invitedProfileId: profileId,
              invitedName,
              referralId: referral.id,
            });
          } catch (err) {
            this.logger.error(
              'Failed to send REFERRAL_ACCEPTED notification (processNewProfile code-based)',
              {
                referralId: referral.id,
                error: err instanceof Error ? err.message : 'Unknown',
              },
            );
          }
        }

        // Only count toward founding member and update tier if email is verified
        if (isEmailVerified) {
          if (!isAmbassador) {
            await this.checkFoundingMember(referrerProfile.id);
          }
          await this.updateTier(referrerProfile.id);
        }

        return;
      }
    }

    // 2. No referral — profile stays WAITING (default)
  }

  /**
   * Called when a user verifies their email.
   * Converts PENDING referrals to ACCEPTED and triggers founding member check + tier update.
   * Also activates the profile if the referrer is an ambassador.
   */
  async acceptPendingReferralOnEmailVerification(
    userId: string,
  ): Promise<void> {
    // Find the user's profile
    const profile = await this.prisma.profile.findFirst({
      where: { userId },
      select: {
        id: true,
        referrerId: true,
        waitlistStatus: true,
      },
    });

    if (!profile || !profile.referrerId) return;

    // Find the PENDING referral for this invited profile
    const pendingReferral = await this.prisma.referral.findFirst({
      where: {
        invitedProfileId: profile.id,
        status: 'PENDING',
      },
      include: {
        referrer: {
          select: { id: true, isAmbassador: true },
        },
      },
    });

    if (!pendingReferral) return;

    // Accept the referral now that email is verified
    await this.prisma.referral.update({
      where: { id: pendingReferral.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Notify referrer that their invitation was accepted
    try {
      const invitedProfile = await this.prisma.profile.findUnique({
        where: { id: profile.id },
        select: { firstName: true, lastName: true },
      });
      const invitedName =
        invitedProfile?.firstName && invitedProfile?.lastName
          ? `${invitedProfile.firstName} ${invitedProfile.lastName}`.trim()
          : 'Un utilisateur';
      await this.notificationHelper.notifyReferralAccepted({
        referrerProfileId: pendingReferral.referrerId,
        invitedProfileId: profile.id,
        invitedName,
        referralId: pendingReferral.id,
      });
    } catch (err) {
      this.logger.error('Failed to send REFERRAL_ACCEPTED notification', {
        referralId: pendingReferral.id,
        error: err instanceof Error ? err.message : 'Unknown',
      });
    }

    // If referrer is ambassador, activate the profile
    if (
      pendingReferral.referrer.isAmbassador &&
      profile.waitlistStatus === 'WAITING'
    ) {
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: {
          waitlistStatus: 'ACTIVE',
          activatedAt: new Date(),
        },
      });
    }

    // Check founding member status for the referrer
    if (!pendingReferral.referrer.isAmbassador) {
      await this.checkFoundingMember(pendingReferral.referrerId);
    }

    // Update referrer's tier
    await this.updateTier(pendingReferral.referrerId);
  }

  /**
   * Check if a referrer has earned Founding Member status (10+ accepted referrals)
   * If yes: activate their profile and award the Founding Member badge.
   *
   * Uses a transaction with atomic conditional update (updateMany with waitlistStatus: 'WAITING')
   * to prevent race conditions where concurrent calls could double-activate and send duplicate emails.
   */
  async checkFoundingMember(referrerProfileId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Count accepted referrals inside the transaction
      const acceptedCount = await tx.referral.count({
        where: {
          referrerId: referrerProfileId,
          status: 'ACCEPTED',
        },
      });

      if (acceptedCount < 10) return;

      // Atomic conditional update: only activates if STILL waiting.
      // If two concurrent transactions race, only one will match waitlistStatus='WAITING'
      // and get count > 0 — the other will see count = 0 and skip activation + email.
      const activated = await tx.profile.updateMany({
        where: {
          id: referrerProfileId,
          waitlistStatus: 'WAITING',
        },
        data: {
          waitlistStatus: 'ACTIVE',
          activatedAt: new Date(),
        },
      });

      const wasActivated = activated.count > 0;

      // Award Founding Member badge (idempotent via upsert)
      const foundingMemberBadge = await tx.badge.findUnique({
        where: { type: 'FOUNDING_MEMBER' },
      });

      if (foundingMemberBadge) {
        await tx.userBadge.upsert({
          where: {
            profileId_badgeId: {
              profileId: referrerProfileId,
              badgeId: foundingMemberBadge.id,
            },
          },
          update: {},
          create: {
            profileId: referrerProfileId,
            badgeId: foundingMemberBadge.id,
          },
        });
      }

      // Send email ONLY if profile was just activated (prevents duplicate emails)
      if (wasActivated) {
        const referrerProfile = await tx.profile.findUnique({
          where: { id: referrerProfileId },
          select: {
            firstName: true,
            user: { select: { email: true } },
          },
        });

        if (referrerProfile) {
          try {
            await this.emailService.sendEmail({
              to: referrerProfile.user.email,
              type: 'founding-member',
              payload: {
                firstName: referrerProfile.firstName,
                userEmail: referrerProfile.user.email,
                referralCount: acceptedCount,
                loginUrl: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/signin`,
              },
            });

            this.logger.info('Founding Member email sent', {
              profileId: referrerProfileId,
              email: referrerProfile.user.email,
            });
          } catch (error) {
            this.logger.error('Failed to send Founding Member email', {
              profileId: referrerProfileId,
              error: (error as Error).message,
            });
            // Don't fail the process if email fails
          }
        }
      }
    });
  }

  /**
   * Update the referrer's tier based on accepted referral count
   */
  async updateTier(profileId: string): Promise<void> {
    const acceptedCount = await this.prisma.referral.count({
      where: {
        referrerId: profileId,
        status: 'ACCEPTED',
      },
    });

    let tier = REFERRAL_TIERS[0].id;
    for (const t of REFERRAL_TIERS) {
      if (acceptedCount >= t.requirement) {
        tier = t.id;
      }
    }

    await this.prisma.referralStats.upsert({
      where: { profileId },
      update: { currentTier: tier },
      create: { profileId, currentTier: tier },
    });
  }

  /**
   * Get waitlist status for a profile
   */
  async getWaitlistStatus(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        waitlistStatus: true,
        activatedAt: true,
        referralCode: true,
        referrerId: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        showInLeaderboard: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Calculate position (profiles created before this one that are still WAITING)
    const position =
      profile.waitlistStatus === 'WAITING'
        ? await this.prisma.profile.count({
            where: {
              waitlistStatus: 'WAITING',
              createdAt: { lte: profile.createdAt },
            },
          })
        : 0;

    // Count referrals dynamically
    const acceptedReferrals = await this.prisma.referral.count({
      where: {
        referrerId: profileId,
        status: 'ACCEPTED',
      },
    });

    const pendingReferrals = await this.prisma.referral.count({
      where: {
        referrerId: profileId,
        status: 'PENDING',
      },
    });

    // Founding Member progress
    const foundingMemberThreshold = 10;
    const foundingMemberProgress = Math.min(
      acceptedReferrals,
      foundingMemberThreshold,
    );

    // Get badges
    const badges = await this.prisma.userBadge.findMany({
      where: { profileId },
      include: { badge: true },
    });

    return {
      status: profile.waitlistStatus,
      position,
      referralCode: profile.referralCode,
      firstName: profile.firstName,
      showInLeaderboard: profile.showInLeaderboard,
      referrals: {
        accepted: acceptedReferrals,
        pending: pendingReferrals,
        total: acceptedReferrals + pendingReferrals,
      },
      foundingMember: {
        progress: foundingMemberProgress,
        threshold: foundingMemberThreshold,
        unlocked: foundingMemberProgress >= foundingMemberThreshold,
      },
      badges: badges.map((ub) => ({
        type: ub.badge.type,
        name: ub.badge.name,
        awardedAt: ub.awardedAt,
      })),
      activatedAt: profile.activatedAt,
    };
  }

  /**
   * Get waitlist leaderboard - top referrers computed dynamically
   * Only shows users who opted in (showInLeaderboard = true)
   */
  async getLeaderboard(limit: number = 20) {
    const leaderboard = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p."firstName",
        p."lastName",
        p."avatarId",
        COUNT(r.id)::int as "acceptedCount"
      FROM "Profile" p
      INNER JOIN "Referral" r ON r."referrerId" = p.id AND r.status = 'ACCEPTED'
      WHERE p."showInLeaderboard" = true
      GROUP BY p.id, p."firstName", p."lastName", p."avatarId"
      HAVING COUNT(r.id) > 0
      ORDER BY COUNT(r.id) DESC
      LIMIT ${limit}
    `;

    return (leaderboard as any[]).map((entry, index) => ({
      rank: index + 1,
      profileId: entry.id,
      firstName: entry.firstName,
      lastName: entry.lastName,
      avatarId: entry.avatarId,
      acceptedCount: entry.acceptedCount,
    }));
  }

  /**
   * Activate a profile (admin or system)
   * Also awards Early Adopter badge if user is in first 500
   */
  async activateProfile(profileId: string): Promise<void> {
    // Get profile info
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        firstName: true,
        waitlistStatus: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const wasWaiting = profile.waitlistStatus === 'WAITING';

    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        waitlistStatus: 'ACTIVE',
        activatedAt: new Date(),
      },
    });

    // Check if eligible for Early Adopter badge (first 500 activated)
    const activeCount = await this.prisma.profile.count({
      where: { waitlistStatus: 'ACTIVE' },
    });

    if (activeCount <= 500) {
      const earlyAdopterBadge = await this.prisma.badge.findUnique({
        where: { type: 'EARLY_ADOPTER' },
      });

      if (earlyAdopterBadge) {
        await this.prisma.userBadge.upsert({
          where: {
            profileId_badgeId: {
              profileId,
              badgeId: earlyAdopterBadge.id,
            },
          },
          update: {},
          create: {
            profileId,
            badgeId: earlyAdopterBadge.id,
          },
        });
      }
    }

    // Send activation email (only if was waiting before)
    if (wasWaiting) {
      try {
        await this.emailService.sendEmail({
          to: profile.user.email,
          type: 'account-activated',
          payload: {
            firstName: profile.firstName,
            userEmail: profile.user.email,
            loginUrl: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/signin`,
          },
        });

        this.logger.info('Account activated email sent', {
          profileId,
          email: profile.user.email,
        });
      } catch (error) {
        this.logger.error('Failed to send account activated email', {
          profileId,
          error: (error as Error).message,
        });
        // Don't fail the activation if email fails
      }
    }
  }

  /**
   * Toggle showInLeaderboard for a profile
   */
  async toggleLeaderboardOptIn(profileId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { showInLeaderboard: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: { showInLeaderboard: !profile.showInLeaderboard },
      select: { showInLeaderboard: true },
    });

    return updated.showInLeaderboard;
  }
}
