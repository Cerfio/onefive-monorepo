import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileService } from '../../profile/profile.service';
import { normalizeString } from '../../common/utils';
import { StorageService } from '../../storage/storage.service';

interface SearchPerson {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  highlight: string | null;
  bio: string | null;
  countryCode: string | null;
  relationshipStatus: string | null;
}

interface SearchCompany {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  tagline: string | null;
  website: string | null;
}

// Format compatible avec ProfilePostCard
interface SearchPost {
  id: string;
  content: string;
  mediaUrls: string[];
  tags: string[];
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  viewsCount: number;
  userReaction: string | null;
  reactions: {
    profileId: string;
    reaction: string;
  }[];
}

// Format compatible avec DiscussionCard (DiscussionInfer)
interface SearchDiscussion {
  id: string;
  question: string;
  context: string | null;
  tags: string[];
  upvoteCount: number;
  hasUpvote: boolean;
  answerCount: number;
  viewCount: number;
  createdAt: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    highlight: string;
    bio: string;
    createdAt: string;
    followedBy: number;
    following: number;
    postsCount: number;
    isFollowing: boolean;
    countryCode: string | null;
    ecosystemRoles: string[];
    streak: number;
  } | null;
}

export interface SearchResult {
  people: SearchPerson[];
  companies: SearchCompany[];
  posts: SearchPost[];
  discussions: SearchDiscussion[];
}

@Injectable()
export class SearchHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    query,
    limit = 20,
  }: {
    transactionId: string;
    userId: string;
    query: string;
    limit?: number;
  }): Promise<SearchResult> {
    this.logger.info('Search: full search across all content', {
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

    const queryLower = query.toLowerCase();
    const normalizedQuery = normalizeString(query);

    // Execute all searches in parallel
    const [profiles, startups, posts, discussions] = await Promise.all([
      this.searchProfiles(query, currentProfile?.id, limit),
      this.searchStartups(query, limit),
      this.searchPosts(query, currentProfile?.id, limit),
      this.searchDiscussions(normalizedQuery, currentProfile?.id, limit),
    ]);

    // Get relationship statuses for found profiles
    const relationshipStatuses = currentProfile?.id
      ? await this.getRelationshipStatuses(
          currentProfile.id,
          profiles.map((p) => p.id),
        )
      : new Map<string, string>();

    this.logger.info('Search: completed', {
      transactionId,
      userId,
      query,
      peopleCount: profiles.length,
      companiesCount: startups.length,
      postsCount: posts.length,
      discussionsCount: discussions.length,
    });

    // Sort all results by relevance
    const sortedProfiles = this.sortByRelevance(profiles, queryLower, (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase(),
    );

    const sortedStartups = this.sortByRelevance(startups, queryLower, (s) =>
      s.name.toLowerCase(),
    );

    // Format results
    const people: SearchPerson[] = sortedProfiles.map((profile) => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar?.id || null,
      highlight: profile.highlight,
      bio: profile.bio,
      countryCode: profile.countryCode,
      ecosystemRoles: profile.ecosystemRoles || [],
      relationshipStatus: relationshipStatuses.get(profile.id) || null,
    }));

    const companies: SearchCompany[] = sortedStartups.map((startup) => ({
      id: startup.id,
      name: startup.name,
      logo: startup.logo,
      description: startup.description,
      tagline: startup.tagline,
      website: startup.website,
    }));

    const formattedPosts: SearchPost[] = await Promise.all(
      posts.map(async (post) => {
        // Get media URLs
        const mediaUrls = await Promise.all(
          (post.medias || []).map(async (media: any) => {
            try {
              // Si media est un objet (nouveau format), on a déjà l'URL
              if (typeof media === 'object' && media.url) {
                return media.url;
              }

              // Si c'est une string (ancien format ou ID de fichier), on essaie de signer l'URL
              // Note: Dans le nouveau système, medias contient des objets {url, mimeType...}
              // Donc ce bloc try/catch est surtout pour la rétrocompatibilité si des IDs traînent
              if (typeof media === 'string' && !media.startsWith('http')) {
                const result = await this.storageService.signUrl({
                  transactionId: 'search-media',
                  data: { fileId: media },
                });
                return result.url;
              }

              return media;
            } catch {
              return null;
            }
          }),
        );

        // Find user's reaction
        const userReaction = post.reactions?.find(
          (r) => r.profileId === currentProfile?.id,
        );

        return {
          id: post.id,
          content: post.content,
          mediaUrls: mediaUrls.filter((url): url is string => url !== null),
          tags: post.tags,
          createdAt: post.createdAt.toISOString(),
          reactionCount: post._count.reactions,
          commentCount: post._count.comments,
          viewsCount: post._count.views,
          userReaction: userReaction?.reaction || null,
          reactions:
            post.reactions?.map((r) => ({
              profileId: r.profileId,
              reaction: r.reaction,
            })) || [],
        };
      }),
    );

    const formattedDiscussions: SearchDiscussion[] = await Promise.all(
      discussions.map(async (discussion) => ({
        id: discussion.id,
        question: discussion.question,
        context: discussion.context,
        tags: discussion.tags,
        upvoteCount: discussion._count.upvotes,
        hasUpvote: discussion.upvotes?.length > 0,
        answerCount: discussion._count.answers,
        viewCount: discussion._count.views,
        createdAt: discussion.createdAt.toISOString(),
        profile: discussion.author
          ? {
              id: discussion.author.id,
              firstName: discussion.author.firstName,
              lastName: discussion.author.lastName,
              avatar: discussion.author.avatar?.id
                ? await (async () => {
                    try {
                      const result = await this.storageService.signUrl({
                        transactionId: 'search-avatar',
                        data: { fileId: discussion.author.avatar.id },
                      });
                      return result.url;
                    } catch {
                      return '';
                    }
                  })()
                : '',
              highlight: discussion.author.highlight || '',
              bio: discussion.author.bio || '',
              createdAt: discussion.author.createdAt.toISOString(),
              followedBy: discussion.author._count?.followedBy || 0,
              following: discussion.author._count?.following || 0,
              postsCount: discussion.author._count?.posts || 0,
              isFollowing: discussion.author.followedBy?.length > 0,
              countryCode: discussion.author.countryCode,
              ecosystemRoles: discussion.author.ecosystemRoles || [],
              streak: 0,
            }
          : null,
      })),
    );

    return {
      people,
      companies,
      posts: formattedPosts,
      discussions: formattedDiscussions,
    };
  }

  private async searchProfiles(
    query: string,
    currentProfileId: string | undefined,
    limit: number,
  ) {
    return this.prisma.profile.findMany({
      where: {
        AND: [
          currentProfileId ? { id: { not: currentProfileId } } : {},
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { highlight: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
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
        bio: true,
        countryCode: true,
        ecosystemRoles: true,
      },
      take: limit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  private async searchStartups(query: string, limit: number) {
    return this.prisma.startup.findMany({
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
        website: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  private async searchPosts(
    query: string,
    currentProfileId: string | undefined,
    limit: number,
  ) {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      select: {
        id: true,
        content: true,
        medias: true,
        tags: true,
        createdAt: true,
        reactions: {
          select: {
            profileId: true,
            reaction: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: { where: { parentId: null } },
            views: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async searchDiscussions(
    normalizedQuery: string,
    currentProfileId: string | undefined,
    limit: number,
  ) {
    return this.prisma.discussion.findMany({
      where: {
        OR: [
          {
            questionUnaccented: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          { content: { contains: normalizedQuery, mode: 'insensitive' } },
          { tags: { hasSome: [normalizedQuery] } },
        ],
      },
      select: {
        id: true,
        question: true,
        context: true,
        tags: true,
        createdAt: true,
        upvotes: currentProfileId
          ? {
              where: { profileId: currentProfileId },
              select: { profileId: true },
            }
          : false,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            highlight: true,
            countryCode: true,
            createdAt: true,
            ecosystemRoles: true,
            avatar: {
              select: {
                id: true,
              },
            },
            followedBy: currentProfileId
              ? {
                  where: { followingId: currentProfileId },
                  select: { followingId: true },
                }
              : false,
            _count: {
              select: {
                followedBy: true,
                following: true,
                posts: true,
              },
            },
          },
        },
        _count: {
          select: {
            upvotes: true,
            answers: true,
            views: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
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

  private async getRelationshipStatuses(
    currentProfileId: string,
    targetProfileIds: string[],
  ): Promise<Map<string, string>> {
    if (targetProfileIds.length === 0) {
      return new Map();
    }

    // Fetch relationships where current user is either requester or accepter
    const relationships = await this.prisma.relationship.findMany({
      where: {
        OR: [
          {
            requesterId: currentProfileId,
            accepterId: { in: targetProfileIds },
          },
          {
            requesterId: { in: targetProfileIds },
            accepterId: currentProfileId,
          },
        ],
      },
      select: {
        requesterId: true,
        accepterId: true,
        status: true,
      },
    });

    // Build a map of profileId -> status
    const statusMap = new Map<string, string>();

    relationships.forEach((rel) => {
      const otherProfileId =
        rel.requesterId === currentProfileId ? rel.accepterId : rel.requesterId;

      // Determine the status from current user's perspective
      if (rel.status === 'ACCEPTED') {
        statusMap.set(otherProfileId, 'CONNECTED');
      } else if (rel.status === 'PENDING') {
        // If current user is the requester, show "PENDING_SENT"
        // If current user is the accepter, show "PENDING_RECEIVED"
        if (rel.requesterId === currentProfileId) {
          statusMap.set(otherProfileId, 'PENDING_SENT');
        } else {
          statusMap.set(otherProfileId, 'PENDING_RECEIVED');
        }
      }
    });

    return statusMap;
  }
}
