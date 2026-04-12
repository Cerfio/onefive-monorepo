import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { AchievementService } from '../achievement.service';
import { BatchUpdateAchievementsDto } from '../dto/achievement.dto';

type BatchUpdateAchievementsHandlerParams = {
  transactionId: string;
  userId: string;
} & BatchUpdateAchievementsDto;

type BatchUpdateAchievementsHandlerResponse = {
  created: number;
  updated: number;
  deleted: number;
};

@Injectable()
export class BatchUpdateAchievementsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly achievementService: AchievementService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    achievements,
    deleteIds,
  }: BatchUpdateAchievementsHandlerParams): Promise<BatchUpdateAchievementsHandlerResponse> {
    // Debug log pour voir les données reçues
    this.logger.info('BatchUpdateAchievementsHandler data received', {
      transactionId,
      userId,
      achievementsCount: achievements.length,
      deleteIdsCount: deleteIds.length,
      achievements: achievements,
      deleteIds: deleteIds,
    });

    // Récupérer l'ID du profil de l'utilisateur
    // Pour l'instant, on fait une requête séparée, mais on pourrait optimiser avec une relation
    const profile = await this.achievementService['prisma'].profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const result = await this.achievementService.batchUpdate({
      transactionId,
      profileId: profile.id,
      achievements,
      deleteIds,
    });

    this.logger.info('Batch update achievements completed', {
      transactionId,
      userId,
      profileId: profile.id,
      result,
    });

    return result;
  }
}
