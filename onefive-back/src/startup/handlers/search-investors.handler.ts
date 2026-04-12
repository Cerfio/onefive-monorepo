import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class SearchInvestorsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
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
  }) {
    this.logger.info('Searching investors (profiles + startups)', {
      transactionId,
      userId,
      query,
      limit,
    });

    // Construire les conditions de recherche en découpant la query en mots
    // Ex: "Marie Dubois" → cherche (firstName~Marie AND lastName~Dubois) OR inverse
    const words = query.trim().split(/\s+/).filter(Boolean);
    const profileWhere =
      words.length >= 2
        ? {
            OR: [
              // Combinaison directe: premier mot = firstName, reste = lastName
              {
                AND: [
                  {
                    firstName: {
                      contains: words[0],
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    lastName: {
                      contains: words.slice(1).join(' '),
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
              // Combinaison inversée: dernier mot = firstName, reste = lastName
              {
                AND: [
                  {
                    firstName: {
                      contains: words[words.length - 1],
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    lastName: {
                      contains: words.slice(0, -1).join(' '),
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
              // Fallback: recherche dans chaque champ individuellement
              ...words.flatMap((word) => [
                {
                  firstName: { contains: word, mode: 'insensitive' as const },
                },
                {
                  lastName: { contains: word, mode: 'insensitive' as const },
                },
              ]),
              {
                highlight: { contains: query, mode: 'insensitive' as const },
              },
            ],
          }
        : {
            OR: [
              {
                firstName: { contains: query, mode: 'insensitive' as const },
              },
              {
                lastName: { contains: query, mode: 'insensitive' as const },
              },
              {
                highlight: { contains: query, mode: 'insensitive' as const },
              },
            ],
          };

    const profiles = await this.prisma.profile.findMany({
      where: profileWhere,
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
      take: Math.floor(limit / 2),
    });

    // Rechercher les startups/fonds
    const startups = await this.prisma.startup.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tagline: { contains: query, mode: 'insensitive' } },
          { categories: { has: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true,
        description: true,
        tagline: true,
      },
      take: Math.floor(limit / 2), // La moitié du limit pour les startups
    });

    this.logger.info('Investors search completed', {
      transactionId,
      userId,
      query,
      profilesCount: profiles.length,
      startupsCount: startups.length,
    });

    // Formater les résultats
    const profileResults = profiles.map((profile) => ({
      type: 'person' as const,
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar?.id,
      highlight: profile.highlight,
      countryCode: profile.countryCode,
    }));

    const startupResults = startups.map((startup) => ({
      type: 'company' as const,
      id: startup.id,
      name: startup.name,
      logo: startup.logo,
      website: startup.website,
      description: startup.description || startup.tagline,
    }));

    return {
      people: profileResults,
      companies: startupResults,
    };
  }
}
