import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { StartupSuggestionResponseDto } from './dto/get-startup-suggestion.dto';

@Injectable()
export class StartupSuggestionService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async get({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<StartupSuggestionResponseDto[]> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      // Get startups not followed by the user
      const startups = await this.prisma.startup.findMany({
        where: {
          followedBy: {
            none: {
              profileId: userProfile.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          categories: true,
          countryCode: true,
          city: true,
          _count: {
            select: {
              members: true,
              followedBy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
      });

      return startups.map((startup) => ({
        id: startup.id,
        name: startup.name,
        description: startup.description || undefined,
        categories: startup.categories || [], // Ensure it's always an array
        countryCode: startup.countryCode,
        city: startup.city,
        membersCount: startup._count.members,
        followersCount: startup._count.followedBy,
        isFollowed: false, // We already filtered out followed startups
      }));
    } catch (error) {
      this.logger.error('Failed to get startup suggestions', {
        transactionId,
        error,
      });
      throw error;
    }
  }
}
