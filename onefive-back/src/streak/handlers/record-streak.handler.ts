import { Inject, Injectable } from '@nestjs/common';
import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { StreakService } from '../streak.service';

export interface RecordStreakResponse {
  currentStreak: number;
}

@Injectable()
export class RecordStreakHandler {
  constructor(
    private readonly streakService: StreakService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<RecordStreakResponse> {
    // Essayer d'enregistrer la connexion pour aujourd'hui
    try {
      await this.streakService.recordConnection({
        transactionId,
        userId,
      });

      // Si ça réussit, c'était une nouvelle connexion
      // Recalculer la streak après l'enregistrement
      const currentStreak = await this.streakService.getCurrentStreak({
        transactionId,
        userId,
      });

      return {
        currentStreak,
      };
    } catch (error: any) {
      // Si c'est une erreur de streak déjà existant (déjà connecté aujourd'hui)
      if (error.code === 'STREAK_ALREADY_EXISTS' || error.statusCode === 409) {
        // Lancer une erreur custom pour que le controller sache gérer
        const customError = new Error('ALREADY_CONNECTED_TODAY');
        (customError as any).isCustomStreakError = true;
        throw customError;
      }

      // Pour les autres erreurs, les relancer
      throw error;
    }
  }
}
