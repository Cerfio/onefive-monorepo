import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationHelperService } from '../notification/notification-helper.service';

// Définition des tiers de parrainage
export const REFERRAL_TIERS = [
  { id: 'starter', name: 'Starter', requirement: 0, color: 'gray' },
  { id: 'bronze', name: 'Bronze', requirement: 3, color: 'amber' },
  { id: 'silver', name: 'Silver', requirement: 10, color: 'slate' },
  { id: 'gold', name: 'Gold', requirement: 25, color: 'yellow' },
  { id: 'platinum', name: 'Platinum', requirement: 50, color: 'purple' },
  { id: 'diamond', name: 'Diamond', requirement: 100, color: 'cyan' },
];

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  /**
   * Calcule le tier basé sur le nombre de parrainages acceptés
   */
  calculateTier(acceptedCount: number): string {
    let tier = REFERRAL_TIERS[0].id;
    for (const t of REFERRAL_TIERS) {
      if (acceptedCount >= t.requirement) {
        tier = t.id;
      }
    }
    return tier;
  }

  /**
   * Récupère les stats de parrainage d'un utilisateur (dynamiquement, pas de counters)
   */
  async getReferralStats(profileId: string) {
    // Compute counts dynamically
    const counts = await this.prisma.referral.groupBy({
      by: ['status'],
      where: { referrerId: profileId },
      _count: true,
    });

    const totalSent = counts.reduce((acc, c) => acc + c._count, 0);
    const totalAccepted =
      counts.find((c) => c.status === 'ACCEPTED')?._count || 0;
    const totalPending =
      counts.find((c) => c.status === 'PENDING')?._count || 0;

    const currentTier = this.calculateTier(totalAccepted);

    // Update tier in stats (only field stored)
    await this.prisma.referralStats.upsert({
      where: { profileId },
      update: { currentTier },
      create: { profileId, currentTier },
    });

    return {
      totalSent,
      totalAccepted,
      totalPending,
      currentTier,
    };
  }

  /**
   * Récupère le leaderboard (dynamiquement via raw query)
   */
  async getLeaderboard(limit: number = 10) {
    const leaderboard = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p."firstName",
        p."lastName",
        p."avatarId",
        COUNT(r.id)::int as "acceptedCount"
      FROM "Profile" p
      INNER JOIN "Referral" r ON r."referrerId" = p.id AND r.status = 'ACCEPTED'
      GROUP BY p.id, p."firstName", p."lastName", p."avatarId"
      HAVING COUNT(r.id) > 0
      ORDER BY COUNT(r.id) DESC
      LIMIT ${limit}
    `;

    return (leaderboard as any[]).map((entry, index) => ({
      rank: index + 1,
      firstName: entry.firstName,
      lastName: entry.lastName,
      avatarId: entry.avatarId,
      totalAccepted: entry.acceptedCount,
      currentTier: this.calculateTier(entry.acceptedCount),
    }));
  }

  /**
   * Récupère les parrainages acceptés d'un utilisateur
   */
  async getMyReferrals(profileId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: profileId, status: 'ACCEPTED' },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedProfile: {
          include: {
            _count: {
              select: {
                following: true,
                followedBy: true,
                discussions: true,
              },
            },
            followedBy: {
              where: { followingId: profileId },
            },
          },
        },
      },
    });

    return referrals.map((r) => ({
      id: r.id,
      invitedEmail: r.invitedEmail,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      acceptedAt: r.acceptedAt?.toISOString() || null,
      invitedUser: r.invitedProfile
        ? {
            profileId: r.invitedProfile.id,
            firstName: r.invitedProfile.firstName,
            lastName: r.invitedProfile.lastName,
            avatarId: r.invitedProfile.avatarId,
            highlight: r.invitedProfile.highlight,
            bio: r.invitedProfile.bio,
            ecosystemRoles: r.invitedProfile.ecosystemRoles,
            countryCode: r.invitedProfile.countryCode,
            isFollowing: r.invitedProfile.followedBy.length > 0,
            stats: {
              followers: r.invitedProfile._count.followedBy,
              following: r.invitedProfile._count.following,
              posts: r.invitedProfile._count.discussions,
            },
          }
        : null,
    }));
  }
}
