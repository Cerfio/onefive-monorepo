import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileService } from '../../profile/profile.service';
import { normalizeString } from '../../common/utils';

interface SearchBarPerson {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  highlight: string | null;
  countryCode: string | null;
}

interface SearchBarCompany {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  tagline: string | null;
}

interface SearchBarDiscussion {
  id: string;
  question: string;
  answerCount: number;
}

export interface SearchBarResult {
  people: SearchBarPerson[];
  companies: SearchBarCompany[];
  discussions: SearchBarDiscussion[];
}

@Injectable()
export class SearchBarHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    query,
    limit = 10,
  }: {
    transactionId: string;
    userId: string;
    query: string;
    limit?: number;
  }): Promise<SearchBarResult> {
    this.logger.info('SearchBar: searching people and companies', {
      transactionId,
      userId,
      query,
      limit,
    });

    // Get current user's profile to exclude from results
    const currentProfile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const thirdLimit = Math.ceil(limit / 3);
    const queryLower = query.toLowerCase();
    const normalizedQuery = normalizeString(query);

    // Search profiles (excluding current user)
    const profiles = await this.prisma.profile.findMany({
      where: {
        AND: [
          currentProfile ? { id: { not: currentProfile.id } } : {},
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { highlight: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: {
          select: {
            id: true,
          },
        },
        highlight: true,
        countryCode: true,
      },
      take: thirdLimit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    // Search startups/companies
    const startups = await this.prisma.startup.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tagline: { contains: query, mode: 'insensitive' } },
          { categories: { hasSome: [query] } },
        ],
      },
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        tagline: true,
      },
      take: thirdLimit,
      orderBy: { name: 'asc' },
    });

    // Search discussions
    const discussions = await this.prisma.discussion.findMany({
      where: {
        OR: [
          {
            questionUnaccented: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          { question: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [normalizedQuery] } },
        ],
      },
      select: {
        id: true,
        question: true,
        _count: {
          select: {
            answers: true,
          },
        },
      },
      take: thirdLimit,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.info('SearchBar: search completed', {
      transactionId,
      userId,
      query,
      peopleCount: profiles.length,
      companiesCount: startups.length,
      discussionsCount: discussions.length,
    });

    // Sort by relevance (exact match first)
    const sortedProfiles = this.sortByRelevance(profiles, queryLower, (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase(),
    );

    const sortedStartups = this.sortByRelevance(startups, queryLower, (s) =>
      s.name.toLowerCase(),
    );

    // Format results
    const people: SearchBarPerson[] = sortedProfiles.map((profile) => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar?.id || null,
      highlight: profile.highlight,
      countryCode: profile.countryCode,
    }));

    const companies: SearchBarCompany[] = sortedStartups.map((startup) => ({
      id: startup.id,
      name: startup.name,
      logo: startup.logo,
      description: startup.description,
      tagline: startup.tagline,
    }));

    // Format discussions (no need to sort, already sorted by createdAt desc)
    const formattedDiscussions: SearchBarDiscussion[] = discussions.map(
      (discussion) => ({
        id: discussion.id,
        question: discussion.question,
        answerCount: discussion._count.answers,
      }),
    );

    return { people, companies, discussions: formattedDiscussions };
  }

  private sortByRelevance<T>(
    items: T[],
    query: string,
    getSearchField: (item: T) => string,
  ): T[] {
    return items.sort((a, b) => {
      const aField = getSearchField(a);
      const bField = getSearchField(b);

      // Exact match first
      const aExact = aField === query;
      const bExact = bField === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with query
      const aStartsWith = aField.startsWith(query);
      const bStartsWith = bField.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Contains query
      const aContains = aField.includes(query);
      const bContains = bField.includes(query);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      return 0;
    });
  }
}
