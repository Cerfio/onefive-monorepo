import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class SearchProfilesHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    query,
    limit = 5,
  }: {
    transactionId: string;
    userId: string;
    query: string;
    limit?: number;
  }) {
    this.logger.info('Searching profiles', {
      transactionId,
      userId,
      query,
      limit,
    });

    const profiles = await this.prisma.profile.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { highlight: { contains: query, mode: 'insensitive' } },
        ],
        id: { not: userId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        highlight: true,
        countryCode: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      take: limit,
    });

    this.logger.info('Profiles search completed', {
      transactionId,
      userId,
      query,
      resultsCount: profiles.length,
    });

    return profiles.map((profile) => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      highlight: profile.highlight,
      countryCode: profile.countryCode,
      email: profile.user?.email || null,
    }));
  }
}
