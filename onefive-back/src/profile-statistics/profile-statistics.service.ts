import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { StreakService } from 'src/streak/streak.service';
import { ProfileStatisticsResponseDto } from './dto/get-profile-statistics.dto';

@Injectable()
export class ProfileStatisticsService {
  constructor(
    private prisma: PrismaService,
    private streakService: StreakService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async get({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<ProfileStatisticsResponseDto> {
    try {
      // Get user's profile with related data
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: {
          id: true,
          _count: {
            select: {
              following: true,
              posts: true,
              postViews: true,
              postReactions: true,
              postComments: true,
            },
          },
        },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      // Get user's streak
      const streakCount = await this.streakService.getCurrentStreak({
        transactionId,
        userId,
      });

      // Calculate statistics
      const postsCreated = userProfile._count.posts;
      const totalReactions = userProfile._count.postReactions;
      const totalComments = userProfile._count.postComments;
      const postsViewed = userProfile._count.postViews;
      const connections = userProfile._count.following;

      // Calculate engagement rate (simplified formula)
      const engagement =
        postsCreated > 0
          ? Math.round(((totalReactions + totalComments) / postsCreated) * 10)
          : 0;

      // Calculate level based on total activity (simplified formula)
      const totalActivity = postsCreated + totalReactions + totalComments;
      const level = Math.floor(totalActivity / 10) + 1;
      const experience = (totalActivity % 10) * 10; // Progress to next level

      return {
        postsViewed,
        engagement: Math.min(engagement, 100), // Cap at 100%
        connections,
        level,
        experience,
        streak: streakCount,
        postsCreated,
        totalReactions,
        totalComments,
      };
    } catch (error) {
      this.logger.error('Failed to get profile statistics', {
        transactionId,
        error,
      });
      throw error;
    }
  }
}
