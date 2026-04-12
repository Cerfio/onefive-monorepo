import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import {
  StreakRecordException,
  StreakCalculationException,
} from './streak.exception';

@Injectable()
export class StreakService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  /**
   * Enregistre une connexion pour aujourd'hui pour un utilisateur
   * @param transactionId ID de transaction pour le tracing
   * @param userId ID de l'utilisateur
   */
  async recordConnection({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<void> {
    // Utiliser UTC pour éviter les problèmes de fuseau horaire
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    try {
      await this.prisma.streak.create({
        data: {
          userId,
          date: today,
        },
      });
    } catch (error: any) {
      // If record already exists for today, throw 409 Conflict
      if (error.code === 'P2002') {
        const conflictError = new Error('Streak already recorded for today');
        (conflictError as any).code = 'STREAK_ALREADY_EXISTS';
        (conflictError as any).statusCode = 409;
        throw conflictError;
      }
      // For other errors, use the exception handler
      StreakRecordException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
      });
    }
  }

  /**
   * Calcule la streak actuelle pour un utilisateur
   * @param transactionId ID de transaction pour le tracing
   * @param userId ID de l'utilisateur
   * @returns Le nombre de jours consécutifs
   */
  async getCurrentStreak({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<number> {
    try {
      const connectionHistory = await this.getConnectionHistory({
        transactionId,
        userId,
        days: 365, // Check last year for streak calculation
      });

      if (connectionHistory.length === 0) {
        return 0;
      }

      const dates = connectionHistory;
      let streak = 0;
      // Utiliser UTC pour la cohérence avec recordConnection
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
      );
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Helper function to compare dates without time
      const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
      };

      // Check if user connected today or yesterday to start counting
      const hasConnectedToday = dates.some((date) => isSameDate(date, today));
      const hasConnectedYesterday = dates.some((date) =>
        isSameDate(date, yesterday),
      );

      if (!hasConnectedToday && !hasConnectedYesterday) {
        // User hasn't connected recently, streak is 0
        return 0;
      }

      // Start counting from today if connected, otherwise from yesterday
      const currentDate = hasConnectedToday ? today : yesterday;
      streak = 1; // Count the starting day (either today or yesterday)

      // Count consecutive days backwards
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - 1);

      while (dates.some((date) => isSameDate(date, checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      return streak;
    } catch (error: any) {
      StreakCalculationException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
      });
    }
  }

  /**
   * Calcule les streaks actuelles pour plusieurs utilisateurs en batch
   * @param transactionId ID de transaction pour le tracing
   * @param userIds Liste des IDs utilisateurs
   * @returns Map userId → nombre de jours consécutifs
   */
  async getCurrentStreakBatch({
    transactionId,
    userIds,
  }: {
    transactionId: string;
    userIds: string[];
  }): Promise<Map<string, number>> {
    if (userIds.length === 0) {
      return new Map();
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);

      // 1 seule requête pour tous les utilisateurs
      const allRecords = await this.prisma.streak.findMany({
        where: {
          userId: { in: userIds },
          date: { gte: cutoffDate },
        },
        orderBy: { date: 'desc' },
        select: { userId: true, date: true },
      });

      // Grouper par userId
      const recordsByUser = new Map<string, Date[]>();
      for (const record of allRecords) {
        const dates = recordsByUser.get(record.userId) || [];
        dates.push(record.date);
        recordsByUser.set(record.userId, dates);
      }

      // Calculer la streak pour chaque utilisateur
      const result = new Map<string, number>();
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
      );
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
      };

      for (const userId of userIds) {
        const dates = recordsByUser.get(userId) || [];
        if (dates.length === 0) {
          result.set(userId, 0);
          continue;
        }

        const hasConnectedToday = dates.some((date) => isSameDate(date, today));
        const hasConnectedYesterday = dates.some((date) =>
          isSameDate(date, yesterday),
        );

        if (!hasConnectedToday && !hasConnectedYesterday) {
          result.set(userId, 0);
          continue;
        }

        const currentDate = hasConnectedToday ? today : yesterday;
        let streak = 1;

        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - 1);

        while (dates.some((date) => isSameDate(date, checkDate))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        result.set(userId, streak);
      }

      return result;
    } catch (error: any) {
      StreakCalculationException.throw(this.logger, {
        transactionId,
        userIds,
        error: error.message,
      });
    }
  }

  /**
   * Obtient l'historique des connexions pour un utilisateur sur une période donnée
   * @param transactionId ID de transaction pour le tracing
   * @param userId ID de l'utilisateur
   * @param days Nombre de jours à remonter
   * @returns Liste des dates de connexion
   */
  async getConnectionHistory({
    transactionId,
    userId,
    days = 30,
  }: {
    transactionId: string;
    userId: string;
    days?: number;
  }): Promise<Date[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const history = await this.prisma.streak.findMany({
        where: {
          userId,
          date: {
            gte: cutoffDate,
          },
        },
        orderBy: { date: 'desc' },
        select: { date: true },
      });

      return history.map((record) => record.date);
    } catch (error: any) {
      StreakRecordException.throw(this.logger, {
        transactionId,
        userId,
        days,
        error: error.message,
      });
    }
  }
}
