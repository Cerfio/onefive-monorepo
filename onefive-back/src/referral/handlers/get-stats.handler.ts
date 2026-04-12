import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ReferralService, REFERRAL_TIERS } from '../referral.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetReferralStatsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly referralService: ReferralService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Getting referral stats', {
      transactionId,
      userId,
    });

    // Récupérer le profile de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Récupérer les statistiques (calculées dynamiquement)
    const stats = await this.referralService.getReferralStats(profile.id);

    // Calculer les paliers
    const tiers = REFERRAL_TIERS.map((t) => ({
      name: t.id,
      threshold: t.requirement,
    }));

    // Trouver le prochain palier
    const currentTierIndex = tiers.findIndex(
      (t) => t.name === stats.currentTier,
    );
    const nextTier = tiers[currentTierIndex + 1] || null;
    const currentTierData = tiers[currentTierIndex];

    // Calculer la progression vers le prochain palier
    let progress = 100;
    let referralsToNextTier = 0;

    if (nextTier) {
      const currentThreshold = currentTierData.threshold;
      const nextThreshold = nextTier.threshold;
      const rangeSize = nextThreshold - currentThreshold;
      const progressInRange = stats.totalAccepted - currentThreshold;
      progress = Math.min(100, Math.round((progressInRange / rangeSize) * 100));
      referralsToNextTier = nextThreshold - stats.totalAccepted;
    }

    this.logger.info('Referral stats retrieved', {
      transactionId,
      profileId: profile.id,
    });

    return {
      totalSent: stats.totalSent,
      totalAccepted: stats.totalAccepted,
      totalPending: stats.totalPending,
      currentTier: stats.currentTier,
      progress,
      nextTier: nextTier?.name || null,
      referralsToNextTier,
      tiers,
    };
  }
}
