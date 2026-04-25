import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { GetNetworkPeopleDto } from './dto/get-network-people.dto';
import { GetNetworkStartupsDto } from './dto/get-network-startups.dto';
import { GetNetworkActivityDto } from './dto/get-network-activity.dto';
import { Log } from '../common/logger/logger.decorator';
import { FileUrlUtils } from '../common/utils';
import { StorageService } from '../storage/storage.service';
import {
  NetworkGetException,
  NetworkCreateException,
  NetworkNotFoundException,
  NetworkAlreadyExistsException,
} from './network.exception';
import { Prisma, RelationshipStatus } from '@prisma/client';

@Injectable()
export class NetworkService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async getNetworkPeople({
    transactionId,
    userId,
    filters,
  }: {
    transactionId: string;
    userId: string;
    filters: GetNetworkPeopleDto;
  }) {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      const myProfileId = userProfile.id;
      const whereClause = this.buildPeopleWhereClause(myProfileId, filters);

      // View-specific constraints
      if (filters.view === 'network') {
        const [iFollow, followsMe] = await Promise.all([
          this.prisma.profileFollow.findMany({
            where: { followedById: myProfileId },
            select: { followingId: true },
          }),
          this.prisma.profileFollow.findMany({
            where: { followingId: myProfileId },
            select: { followedById: true },
          }),
        ]);
        const networkIds = Array.from(
          new Set([
            ...iFollow.map((f) => f.followingId),
            ...followsMe.map((f) => f.followedById),
          ]),
        );
        if (networkIds.length === 0) {
          return [];
        }
        (whereClause as any).id = { in: networkIds };
      } else {
        // discover: exclude me and my network for better discovery
        const [iFollow, followsMe] = await Promise.all([
          this.prisma.profileFollow.findMany({
            where: { followedById: myProfileId },
            select: { followingId: true },
          }),
          this.prisma.profileFollow.findMany({
            where: { followingId: myProfileId },
            select: { followedById: true },
          }),
        ]);
        const excludeIds = Array.from(
          new Set([
            myProfileId,
            ...iFollow.map((f) => f.followingId),
            ...followsMe.map((f) => f.followedById),
          ]),
        );
        (whereClause as any).id = { notIn: excludeIds };
      }
      const orderBy = this.buildPeopleOrderBy(filters.sort);

      // Preload relationship and follow edges for enrichment (batch once)
      const [outgoingRequests, incomingRequests, myFollows] = await Promise.all(
        [
          this.prisma.relationship.findMany({
            where: { requesterId: myProfileId },
            select: { requesterId: true, accepterId: true, status: true },
          }),
          this.prisma.relationship.findMany({
            where: { accepterId: myProfileId },
            select: { requesterId: true, accepterId: true, status: true },
          }),
          this.prisma.profileFollow.findMany({
            where: { followedById: myProfileId },
            select: { followingId: true },
          }),
        ],
      );

      const outgoingMap = new Map(
        outgoingRequests.map((r) => [r.accepterId, r.status]),
      );
      const incomingMap = new Map(
        incomingRequests.map((r) => [r.requesterId, r.status]),
      );
      const followSet = new Set(myFollows.map((f) => f.followingId));

      const people = await this.prisma.profile.findMany({
        where: whereClause,
        orderBy,
        take: filters.limit,
        skip: filters.offset,
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
          bio: true,
          skills: true,
          city: true,
          countryCode: true,
          createdAt: true,
          user: {
            select: {
              email: true,
            },
          },
          experiences: {
            take: 1,
            select: {
              company: true,
              title: true,
            },
          },
          educations: {
            take: 1,
            select: {
              school: true,
              degree: true,
            },
            orderBy: { from: 'desc' },
          },
        },
      });

      // Process people with avatars in parallel
      const peopleWithAvatars = await Promise.all(
        people.map(async (person) => {
          const relationStatus = (() => {
            const out = outgoingMap.get(person.id);
            const inc = incomingMap.get(person.id);
            return out ?? inc ?? null;
          })();
          const isFollow = followSet.has(person.id);
          // Déterminer l'intention basée sur le highlight/bio
          const highlight = person.highlight || '';
          const bio = person.bio || '';
          const combinedText = `${highlight} ${bio}`.toLowerCase();

          let intention = 'Cherche des opportunités';
          let intentionCategory:
            | 'opportunities'
            | 'hiring'
            | 'investing'
            | 'mentoring' = 'opportunities';

          if (
            combinedText.includes('recrut') ||
            combinedText.includes('cherche') ||
            combinedText.includes('team')
          ) {
            intention = 'Recrute activement';
            intentionCategory = 'hiring';
          } else if (
            combinedText.includes('invest') ||
            combinedText.includes('capital') ||
            combinedText.includes('funding')
          ) {
            intention = 'Investit dans des startups';
            intentionCategory = 'investing';
          } else if (
            combinedText.includes('mentor') ||
            combinedText.includes('accompagn') ||
            combinedText.includes('conseil')
          ) {
            intention = 'Mentore des entrepreneurs';
            intentionCategory = 'mentoring';
          }

          // Déterminer le rôle basé sur les expériences et skills
          let role: 'entrepreneur' | 'investor' | 'mentor' | 'developer' =
            'entrepreneur';
          const skills = person.skills || [];
          const hasDevSkills = skills.some((skill) =>
            [
              'javascript',
              'typescript',
              'react',
              'node',
              'python',
              'java',
              'php',
              'dev',
              'developp',
            ].includes(skill.toLowerCase()),
          );

          if (hasDevSkills) {
            role = 'developer';
          } else if (
            combinedText.includes('investisseur') ||
            combinedText.includes('angel') ||
            combinedText.includes('vc')
          ) {
            role = 'investor';
          } else if (combinedText.includes('mentor')) {
            role = 'mentor';
          }

          // Générer les tags dynamiquement
          const tags = [];
          if (person.skills && person.skills.length > 0) {
            tags.push(...person.skills.slice(0, 2)); // Prendre max 2 skills
          }
          if (role === 'entrepreneur') tags.push('Entrepreneur');
          if (role === 'investor') tags.push('Investisseur');
          if (role === 'mentor') tags.push('Mentor');
          if (role === 'developer') tags.push('Développeur');

          return {
            id: person.id,
            name: `${person.firstName} ${person.lastName}`,
            avatar: person.avatar?.id
              ? await this.fileUrlUtils.getFileUrl(
                  person.avatar.id,
                  this.storageService,
                )
              : '/default-avatar.svg',
            title: person.highlight || this.getRoleDisplayName(role),
            location: `${person.city}, ${person.countryCode}`,
            countryCode: person.countryCode,
            intention,
            intentionCategory,
            role,
            tags: [...new Set(tags)], // Éliminer les doublons
            experience:
              person.experiences.length > 0
                ? [
                    {
                      company: person.experiences[0].company,
                      title: person.experiences[0].title,
                    },
                  ]
                : [],
            education:
              person.educations.length > 0
                ? [
                    {
                      school: person.educations[0].school,
                      degree: person.educations[0].degree,
                    },
                  ]
                : [],
            createdAt: person.createdAt.toISOString(),
            relationStatus,
            isFollow,
          };
        }),
      );

      return peopleWithAvatars;
    } catch (error) {
      NetworkGetException.throw(this.logger, { transactionId, userId, error });
    }
  }

  @Log()
  async getNetworkStartups({
    transactionId,
    userId,
    filters,
  }: {
    transactionId: string;
    userId: string;
    filters: GetNetworkStartupsDto;
  }) {
    try {
      // Resolve my profile id
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!userProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      const myProfileId = userProfile.id;

      const whereClause = this.buildStartupsWhereClause(userId, filters);
      if (filters.view === 'network') {
        const startupFollows = await this.prisma.startupFollow.findMany({
          where: { profileId: myProfileId },
          select: { startupId: true },
        });
        const startupIds = startupFollows.map((f) => f.startupId);
        if (startupIds.length === 0) {
          return [];
        }
        (whereClause as any).id = { in: startupIds };
      }
      const orderBy = this.buildStartupsOrderBy(filters.sort);

      // Preload follows for startups
      const myStartupFollows = await this.prisma.startupFollow.findMany({
        where: { profileId: myProfileId },
        select: { startupId: true },
      });
      const startupFollowSet = new Set(
        myStartupFollows.map((f) => f.startupId),
      );

      const startups = await this.prisma.startup.findMany({
        where: whereClause,
        orderBy,
        take: filters.limit,
        skip: filters.offset,
        select: {
          id: true,
          name: true,
          description: true,
          city: true,
          countryCode: true,
          createdAt: true,
          categories: true,
        },
      });

      return startups.map((startup) => {
        // Déterminer l'intention basée sur le bio et les catégories
        const description = startup.description || '';
        const categories = startup.categories || [];
        const combinedText =
          `${description} ${categories.join(' ')}`.toLowerCase();

        let intention = 'Recrute activement';
        let intentionCategory: 'hiring' | 'investing' | 'opportunities' =
          'hiring';

        if (
          combinedText.includes('invest') ||
          combinedText.includes('funding') ||
          combinedText.includes('capital')
        ) {
          intention = 'Lève des fonds';
          intentionCategory = 'investing';
        } else if (
          combinedText.includes('partenair') ||
          combinedText.includes('opportunit') ||
          combinedText.includes('collabor')
        ) {
          intention = 'Cherche des partenariats';
          intentionCategory = 'opportunities';
        }

        // Déterminer le secteur basé sur les catégories
        const industry = categories.length > 0 ? categories[0] : 'Technology';

        // Estimer le stage basé sur l'ancienneté (très basique)
        const now = new Date();
        const createdAt = startup.createdAt;
        const ageInMonths =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

        let stage = 'Seed';
        if (ageInMonths > 24) stage = 'Series A';
        else if (ageInMonths > 12) stage = 'Pre-seed';

        // Estimation basique du funding
        const fundingEstimates = {
          Seed: '500k€',
          'Pre-seed': '200k€',
          'Series A': '2M€',
        };

        return {
          id: startup.id,
          name: startup.name,
          logo: '/default-startup-logo.png',
          tagline: startup.description || 'Innovation en cours',
          location: `${startup.city}, ${startup.countryCode}`,
          countryCode: startup.countryCode,
          intention,
          intentionCategory,
          stats: {
            stage,
            industry,
            funding:
              fundingEstimates[stage as keyof typeof fundingEstimates] ||
              '500k€',
          },
          createdAt: startup.createdAt.toISOString(),
          isFollow: startupFollowSet.has(startup.id),
        };
      });
    } catch (error) {
      NetworkGetException.throw(this.logger, { transactionId, userId, error });
    }
  }

  @Log()
  async getNetworkActivity({
    transactionId,
    userId,
    filters,
  }: {
    transactionId: string;
    userId: string;
    filters: GetNetworkActivityDto;
  }) {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      // Récupérer les connexions de l'utilisateur pour connaître son réseau
      const userConnections = await this.prisma.relationship.findMany({
        where: {
          status: RelationshipStatus.ACCEPTED,
          OR: [{ requesterId: userProfile.id }, { accepterId: userProfile.id }],
        },
        select: {
          requesterId: true,
          accepterId: true,
        },
      });

      // Extraire les IDs des personnes connectées
      const connectedUserIds = userConnections.map((rel) =>
        rel.requesterId === userProfile.id ? rel.accepterId : rel.requesterId,
      );

      if (connectedUserIds.length === 0) {
        return [];
      }

      // Récupérer les activités récentes dans le réseau
      const activities: any[] = [];

      // 1. Nouvelles connexions dans le réseau (depuis 7 jours)
      const recentConnections = await this.prisma.relationship.findMany({
        where: {
          OR: [
            { requesterId: { in: connectedUserIds } },
            { accepterId: { in: connectedUserIds } },
          ],
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
          },
        },
        include: {
          requester: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
          accepter: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // 2. Nouveaux posts des personnes connectées (depuis 3 jours)
      const recentPosts = await this.prisma.post.findMany({
        where: {
          profileId: { in: connectedUserIds },
          createdAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
          },
        },
        include: {
          author: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // 3. Nouveaux follows de profils (depuis 3 jours)
      const recentProfileFollows = await this.prisma.profileFollow.findMany({
        where: {
          followedById: { in: connectedUserIds },
          createdAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
          },
        },
        include: {
          following: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
          followedBy: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // 4. Nouveaux follows de startups (depuis 3 jours)
      const recentStartupFollows = await this.prisma.startupFollow.findMany({
        where: {
          profileId: { in: connectedUserIds },
          createdAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
          },
        },
        include: {
          startup: {
            select: {
              id: true,
              name: true,
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
          profile: {
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
              city: true,
              countryCode: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // Transformer les données en format d'activité
      for (const connection of recentConnections) {
        const myProfileIdLocal = userProfile.id;
        const otherPerson =
          connection.requesterId === myProfileIdLocal
            ? connection.accepter
            : connection.requester;
        activities.push({
          id: `connection-${connection.requesterId}-${connection.accepterId}`,
          type: 'NEW_CONNECTION',
          person: {
            id: otherPerson.id,
            name: `${otherPerson.firstName} ${otherPerson.lastName}`,
            avatar: otherPerson.avatar?.id
              ? await this.fileUrlUtils.getFileUrl(
                  otherPerson.avatar.id,
                  this.storageService,
                )
              : '/default-avatar.svg',
            title: otherPerson.highlight || 'Entrepreneur',
            location: `${otherPerson.city}, ${otherPerson.countryCode}`,
            countryCode: this.getCountryCode(otherPerson.countryCode),
            intention: 'Cherche des opportunités',
            intentionCategory: 'opportunities' as const,
            role: 'entrepreneur' as const,
            tags: ['Entrepreneur'],
            experience: [],
            education: [],
            createdAt: otherPerson.createdAt.toISOString(),
          },
          timestamp: connection.createdAt.toISOString(),
          details: 'a rejoint votre réseau',
        });
      }

      for (const post of recentPosts) {
        activities.push({
          id: `post-${post.id}`,
          type: 'NEW_POST',
          person: {
            id: post.author.id,
            name: `${post.author.firstName} ${post.author.lastName}`,
            avatar: post.author.avatar?.id
              ? await this.fileUrlUtils.getFileUrl(
                  post.author.avatar.id,
                  this.storageService,
                )
              : '/default-avatar.svg',
            title: post.author.highlight || 'Entrepreneur',
            location: `${post.author.city}, ${post.author.countryCode}`,
            countryCode: this.getCountryCode(post.author.countryCode),
            intention: 'Cherche des opportunités',
            intentionCategory: 'opportunities' as const,
            role: 'entrepreneur' as const,
            tags: ['Entrepreneur'],
            experience: [],
            education: [],
            createdAt: post.author.createdAt.toISOString(),
          },
          timestamp: post.createdAt.toISOString(),
          details: 'a publié un nouveau post',
          content:
            post.content.length > 100
              ? `${post.content.substring(0, 100)}...`
              : post.content,
        });
      }

      for (const follow of recentProfileFollows) {
        activities.push({
          id: `follow-profile-${follow.followingId}-${follow.followedById}`,
          type: 'PROFILE_FOLLOW',
          person: {
            id: follow.followedBy.id,
            name: `${follow.followedBy.firstName} ${follow.followedBy.lastName}`,
            avatar: follow.followedBy.avatar?.id
              ? await this.fileUrlUtils.getFileUrl(
                  follow.followedBy.avatar.id,
                  this.storageService,
                )
              : '/default-avatar.svg',
            title: follow.followedBy.highlight || 'Entrepreneur',
            location: `${follow.followedBy.city}, ${follow.followedBy.countryCode}`,
            countryCode: this.getCountryCode(follow.followedBy.countryCode),
            intention: 'Cherche des opportunités',
            intentionCategory: 'opportunities' as const,
            role: 'entrepreneur' as const,
            tags: ['Entrepreneur'],
            experience: [],
            education: [],
            createdAt: follow.followedBy.createdAt.toISOString(),
          },
          targetPerson: {
            id: follow.following.id,
            name: `${follow.following.firstName} ${follow.following.lastName}`,
          },
          timestamp: follow.createdAt.toISOString(),
          details: `suit maintenant ${follow.following.firstName} ${follow.following.lastName}`,
        });
      }

      for (const follow of recentStartupFollows) {
        activities.push({
          id: `follow-startup-${follow.startupId}-${follow.profileId}`,
          type: 'STARTUP_FOLLOW',
          person: {
            id: follow.profile.id,
            name: `${follow.profile.firstName} ${follow.profile.lastName}`,
            avatar: follow.profile.avatar?.id
              ? await this.fileUrlUtils.getFileUrl(
                  follow.profile.avatar.id,
                  this.storageService,
                )
              : '/default-avatar.svg',
            title: follow.profile.highlight || 'Entrepreneur',
            location: `${follow.profile.city}, ${follow.profile.countryCode}`,
            countryCode: this.getCountryCode(follow.profile.countryCode),
            intention: 'Cherche des opportunités',
            intentionCategory: 'opportunities' as const,
            role: 'entrepreneur' as const,
            tags: ['Entrepreneur'],
            experience: [],
            education: [],
            createdAt: follow.profile.createdAt.toISOString(),
          },
          targetStartup: {
            id: follow.startup.id,
            name: follow.startup.name,
          },
          timestamp: follow.createdAt.toISOString(),
          details: `suit maintenant la startup ${follow.startup.name}`,
        });
      }

      // Trier par date et limiter
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      return activities.slice(0, filters.limit);
    } catch (error) {
      NetworkGetException.throw(this.logger, { transactionId, userId, error });
    }
  }

  @Log()
  async connectProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Get requester's profile
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'Requester profile not found',
        );
      }

      const requesterId = requesterProfile.id;

      // Reject self-connection before touching the DB further
      if (requesterId === profileId) {
        throw new BadRequestException(
          'You cannot send a connection request to yourself',
        );
      }

      // Check if accepter profile exists
      const accepterProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });

      if (!accepterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, profileId },
          'Accepter profile not found',
        );
      }

      // Vérifier si la connexion existe déjà
      const existingConnection = await this.prisma.relationship.findFirst({
        where: {
          OR: [
            { requesterId: requesterId, accepterId: profileId },
            { requesterId: profileId, accepterId: requesterId },
          ],
        },
      });

      if (existingConnection) {
        // Si une demande existe déjà dans l'autre sens (connexion simultanée), l'accepter automatiquement
        if (
          existingConnection.requesterId === profileId &&
          existingConnection.accepterId === requesterId
        ) {
          // La demande existe dans l'autre sens, l'accepter automatiquement
          const acceptedConnection = await this.prisma.relationship.update({
            where: {
              requesterId_accepterId: {
                requesterId: profileId,
                accepterId: requesterId,
              },
            },
            data: { status: RelationshipStatus.ACCEPTED },
          });

          return {
            id: `${acceptedConnection.requesterId}-${acceptedConnection.accepterId}`,
            requesterId: acceptedConnection.requesterId,
            accepterId: acceptedConnection.accepterId,
            status: acceptedConnection.status,
            createdAt: acceptedConnection.createdAt,
            autoAccepted: true, // Indicateur que la connexion a été acceptée automatiquement
          };
        }

        // Sinon, la demande existe déjà dans le même sens (pending ou accepted)
        throw new ConflictException('Connection request already exists');
      }

      // Créer la demande de connexion
      const connection = await this.prisma.relationship.create({
        data: {
          requesterId: requesterId,
          accepterId: profileId,
          status: RelationshipStatus.PENDING,
        },
      });

      return {
        id: `${connection.requesterId}-${connection.accepterId}`, // Composite key
        requesterId: connection.requesterId,
        accepterId: connection.accepterId,
        createdAt: connection.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('Connection request already exists');
      }
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async acceptConnection({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Resolve my profile id
      const me = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!me) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      // Update status from PENDING to ACCEPTED (the other user requested me)
      const updated = await this.prisma.relationship.update({
        where: {
          requesterId_accepterId: {
            requesterId: profileId,
            accepterId: me.id,
          },
        },
        data: { status: RelationshipStatus.ACCEPTED },
      });

      return {
        id: `${updated.requesterId}-${updated.accepterId}`,
        requesterId: updated.requesterId,
        accepterId: updated.accepterId,
        status: updated.status,
        createdAt: updated.createdAt,
      };
    } catch (error) {
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async followProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Get requester's profile
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'Requester profile not found',
        );
      }

      const requesterId = requesterProfile.id;

      // Check if accepter profile exists
      const accepterProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });

      if (!accepterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, profileId },
          'Accepter profile not found',
        );
      }

      // Vérifier si le follow existe déjà
      const existingFollow = await this.prisma.profileFollow.findUnique({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      if (existingFollow) {
        throw new ConflictException('Already following this profile');
      }

      // Créer le follow
      const follow = await this.prisma.profileFollow.create({
        data: {
          followingId: profileId,
          followedById: requesterId,
        },
      });

      return {
        id: `${follow.followingId}-${follow.followedById}`, // Composite key
        followingId: follow.followingId,
        followedById: follow.followedById,
        createdAt: follow.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('Already following this profile');
      }
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async unfollowProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Get requester's profile
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'Requester profile not found',
        );
      }

      const requesterId = requesterProfile.id;

      // Supprimer le follow
      const follow = await this.prisma.profileFollow.delete({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      return {
        id: `${follow.followingId}-${follow.followedById}`,
        followingId: follow.followingId,
        followedById: follow.followedById,
      };
    } catch (error) {
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async followStartup({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    try {
      // Get requester's profile
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!requesterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'Requester profile not found',
        );
      }
      // Vérifier si le follow existe déjà
      const existingFollow = await this.prisma.startupFollow.findUnique({
        where: {
          profileId_startupId: {
            profileId: requesterProfile.id,
            startupId: startupId,
          },
        },
      });

      if (existingFollow) {
        throw new ConflictException('Already following this startup');
      }

      // Créer le follow
      const follow = await this.prisma.startupFollow.create({
        data: {
          profileId: requesterProfile.id,
          startupId: startupId,
        },
      });

      return {
        id: `${follow.profileId}-${follow.startupId}`, // Composite key
        profileId: follow.profileId,
        startupId: follow.startupId,
        createdAt: follow.createdAt,
      };
    } catch (error) {
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async unfollowStartup({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    try {
      // Get requester's profile
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!requesterProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'Requester profile not found',
        );
      }
      // Supprimer le follow
      const follow = await this.prisma.startupFollow.delete({
        where: {
          profileId_startupId: {
            profileId: requesterProfile.id,
            startupId: startupId,
          },
        },
      });

      return {
        id: `${follow.profileId}-${follow.startupId}`,
        profileId: follow.profileId,
        startupId: follow.startupId,
      };
    } catch (error) {
      NetworkCreateException.throw(this.logger, {
        transactionId,
        userId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async getUserRelationships({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      // Récupérer les connexions (relationships)
      const relationships = await this.prisma.relationship.findMany({
        where: {
          OR: [{ requesterId: userProfile.id }, { accepterId: userProfile.id }],
        },
        select: {
          requesterId: true,
          accepterId: true,
          status: true,
        },
      });

      // Séparer les connexions en cours (pending) et acceptées (connected)
      const pendingOutgoing: string[] = [];
      const pendingIncoming: string[] = [];
      const connected: string[] = [];

      const myProfileIdLocal = userProfile.id;
      relationships.forEach((rel) => {
        const otherUserId =
          rel.requesterId === myProfileIdLocal
            ? rel.accepterId
            : rel.requesterId;
        if (rel.status === RelationshipStatus.ACCEPTED) {
          connected.push(otherUserId);
        } else if (rel.status === RelationshipStatus.PENDING) {
          if (rel.requesterId === myProfileIdLocal)
            pendingOutgoing.push(otherUserId);
          else pendingIncoming.push(otherUserId);
        }
      });

      return { connected, pendingOutgoing, pendingIncoming };
    } catch (error) {
      NetworkGetException.throw(this.logger, { transactionId, userId, error });
    }
  }

  @Log()
  async getUserFollows({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        NetworkNotFoundException.throw(
          this.logger,
          { transactionId, userId },
          'User profile not found',
        );
      }

      // Récupérer les profils suivis
      const profileFollows = await this.prisma.profileFollow.findMany({
        where: {
          followedById: userProfile.id,
        },
        select: {
          followingId: true,
        },
      });

      // Récupérer les startups suivies
      const startupFollows = await this.prisma.startupFollow.findMany({
        where: {
          profileId: userProfile.id,
        },
        select: {
          startupId: true,
        },
      });

      return {
        profiles: profileFollows.map((f) => f.followingId),
        startups: startupFollows.map((f) => f.startupId),
      };
    } catch (error) {
      NetworkGetException.throw(this.logger, { transactionId, userId, error });
    }
  }

  private buildPeopleWhereClause(
    profileId: string,
    filters: GetNetworkPeopleDto,
  ) {
    const where: Prisma.ProfileWhereInput = {
      id: { not: profileId }, // Exclure l'utilisateur actuel
    };

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { highlight: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.location && filters.location !== 'all') {
      where.city = { contains: filters.location, mode: 'insensitive' };
    }

    // Filtre par intention (basé sur les tags ou le highlight)
    if (filters.intention && filters.intention !== 'all') {
      switch (filters.intention) {
        case 'opportunities':
          where.OR = where.OR
            ? [
                ...where.OR,
                { highlight: { contains: 'opportunit', mode: 'insensitive' } },
              ]
            : [{ highlight: { contains: 'opportunit', mode: 'insensitive' } }];
          break;
        case 'hiring':
          where.OR = where.OR
            ? [
                ...where.OR,
                { highlight: { contains: 'recrut', mode: 'insensitive' } },
              ]
            : [{ highlight: { contains: 'recrut', mode: 'insensitive' } }];
          break;
        case 'investing':
          where.OR = where.OR
            ? [
                ...where.OR,
                { highlight: { contains: 'invest', mode: 'insensitive' } },
              ]
            : [{ highlight: { contains: 'invest', mode: 'insensitive' } }];
          break;
        case 'mentoring':
          where.OR = where.OR
            ? [
                ...where.OR,
                { highlight: { contains: 'mentor', mode: 'insensitive' } },
              ]
            : [{ highlight: { contains: 'mentor', mode: 'insensitive' } }];
          break;
      }
    }

    // Filtre par rôle (basé sur ecosystemRoles - ProfileRole enum)
    if (filters.role && filters.role !== 'all') {
      // Le rôle doit correspondre à une valeur de l'enum ProfileRole
      where.ecosystemRoles = {
        has: filters.role as any, // Le filtre correspond directement aux valeurs ProfileRole
      };
    }

    return where;
  }

  private buildStartupsWhereClause(
    userId: string,
    filters: GetNetworkStartupsDto,
  ) {
    const where: Prisma.StartupWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.location && filters.location !== 'all') {
      where.city = { contains: filters.location, mode: 'insensitive' };
    }

    // Filtre par intention pour les startups (basé sur le bio ou les catégories)
    if (filters.intention && filters.intention !== 'all') {
      switch (filters.intention) {
        case 'hiring':
          where.OR = where.OR
            ? [
                ...where.OR,
                { description: { contains: 'recrut', mode: 'insensitive' } },
              ]
            : [{ description: { contains: 'recrut', mode: 'insensitive' } }];
          break;
        case 'investing':
          where.OR = where.OR
            ? [
                ...where.OR,
                { description: { contains: 'invest', mode: 'insensitive' } },
              ]
            : [{ description: { contains: 'invest', mode: 'insensitive' } }];
          break;
        case 'opportunities':
          where.OR = where.OR
            ? [
                ...where.OR,
                {
                  description: { contains: 'opportunit', mode: 'insensitive' },
                },
              ]
            : [
                {
                  description: { contains: 'opportunit', mode: 'insensitive' },
                },
              ];
          break;
      }
    }

    return where;
  }

  private buildPeopleOrderBy(
    sort?: string,
  ): Prisma.ProfileOrderByWithRelationInput {
    switch (sort) {
      case 'name':
        return { firstName: 'asc' };
      case 'location':
        return { city: 'asc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private buildStartupsOrderBy(
    sort?: string,
  ): Prisma.StartupOrderByWithRelationInput {
    switch (sort) {
      case 'name':
        return { name: 'asc' };
      case 'location':
        return { city: 'asc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private getCountryCode(country: string): string {
    const countryMap: Record<string, string> = {
      France: 'FR',
      Germany: 'DE',
      'United Kingdom': 'GB',
      Spain: 'ES',
      Netherlands: 'NL',
      Switzerland: 'CH',
      'United States': 'US',
    };
    return countryMap[country] || 'FR';
  }

  private getRoleDisplayName(
    role: 'entrepreneur' | 'investor' | 'mentor' | 'developer',
  ): string {
    const roleMap = {
      entrepreneur: 'Entrepreneur',
      investor: 'Investisseur',
      mentor: 'Mentor',
      developer: 'Développeur',
    };
    return roleMap[role] || 'Entrepreneur';
  }
}
