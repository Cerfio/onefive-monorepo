import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import { ProfileFollowService } from '../../profile-follow/profile-follow.service';
import { StreakService } from '../../streak/streak.service';
import {
  processSearchQuery,
  normalizeString,
  FileUrlUtils,
} from '../../common/utils';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class ListDiscussionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionService: DiscussionService,
    private readonly profileService: ProfileService,
    private readonly profileFollowService: ProfileFollowService,
    private readonly storageService: StorageService,
    private readonly streakService: StreakService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    userId,
    limit,
    offset,
    tag,
    search,
    sort,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    limit: number;
    offset: number;
    tag?: string;
    search?: string;
    sort?: string;
    profileId?: string;
  }) {
    // Récupérer le profileId de l'utilisateur connecté
    const currentUserProfile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const where: any = {};
    let orderBy: any = { createdAt: 'desc' }; // default sort

    // Apply profileId filter
    if (profileId) {
      where.profileId = profileId;
    }

    // Apply tag filter
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Apply search filter
    if (search) {
      const processedQuery = processSearchQuery(search);
      const normalizedQuery = normalizeString(processedQuery);

      where.OR = [
        {
          questionUnaccented: {
            contains: normalizedQuery,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: normalizedQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Apply sort
    if (sort === 'MOST_UPVOTED') {
      orderBy = {
        upvotes: {
          _count: 'desc',
        },
      };
    } else if (sort === 'MOST_ANSWERED') {
      orderBy = {
        answers: {
          _count: 'desc',
        },
      };
    } else if (sort === 'MOST_VIEWED') {
      orderBy = {
        views: {
          _count: 'desc',
        },
      };
    }

    const discussions = await this.discussionService.list({
      transactionId,
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        profileId: true,
        content: true,
        context: true,
        options: true,
        question: true,
        type: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        reactions: {
          select: {
            profileId: true,
            reaction: true,
          },
        },
        upvotes: {
          where: {
            profileId: currentUserProfile.id,
          },
          select: {
            profileId: true,
          },
        },
        // Votes du sondage — pour afficher résultats + état "déjà voté" inline
        pollVotes: {
          select: {
            option: true,
            profileId: true,
          },
        },
        _count: {
          select: {
            views: true,
            upvotes: true,
            answers: true,
          },
        },
      },
    });

    if (discussions.length === 0) {
      return [];
    }

    // Enrichir avec les profils des auteurs
    const authorProfileIds = Array.from(
      new Set(discussions.map((discussion: any) => discussion.profileId)),
    );
    const profiles = await this.profileService.list({
      transactionId,
      where: { id: { in: authorProfileIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        bio: true,
        highlight: true,
        countryCode: true,
        ecosystemRoles: true,
        avatar: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            followedBy: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    const profileById = new Map(
      profiles.map((profile: any) => [profile.id, profile]),
    );

    // Batch streaks — 1 requête au lieu de N
    const streakById = await this.streakService.getCurrentStreakBatch({
      transactionId,
      userIds: authorProfileIds as string[],
    });

    // Batch isFollowing — 1 requête au lieu de N
    const otherAuthorIds = authorProfileIds.filter(
      (id) => id !== currentUserProfile.id,
    ) as string[];
    const followingSet = await this.profileFollowService.areFollowingBatch(
      currentUserProfile.id,
      otherAuthorIds,
    );

    return Promise.all(
      discussions.map(async (discussion: any) => {
        const profile = profileById.get(discussion.profileId);

        // Vérifier si l'utilisateur courant suit ce profil (depuis le batch)
        const isFollowing =
          profile && currentUserProfile.id !== profile.id
            ? followingSet.has(profile.id)
            : false;

        // Résultats de sondage + état "déjà voté" (parité avec get-discussion)
        const pollVotes = (discussion.pollVotes || []) as Array<{
          option: string;
          profileId: string;
        }>;
        const pollResults: Record<string, number> = {};
        for (const vote of pollVotes) {
          pollResults[vote.option] = (pollResults[vote.option] || 0) + 1;
        }
        const hasVoted = pollVotes.some(
          (vote) => vote.profileId === currentUserProfile.id,
        );

        return {
          id: discussion.id,
          question: discussion.question,
          content: discussion.content,
          context: discussion.context || undefined,
          options: discussion.options,
          type: discussion.type,
          tags: discussion.tags,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
          upvoteCount: discussion._count?.upvotes || 0,
          hasUpvote: discussion.upvotes && discussion.upvotes.length > 0,
          answerCount: discussion._count?.answers || 0,
          viewCount: discussion._count?.views || 0,
          pollResults,
          hasVoted,
          reactions: discussion.reactions || [],
          profile: profile
            ? {
                id: profile.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                createdAt: profile.createdAt,
                bio: profile.bio,
                highlight: profile.highlight,
                followedBy: profile._count?.followedBy || 0,
                following: profile._count?.following || 0,
                postsCount: profile._count?.posts || 0,
                isFollowing,
                countryCode: profile.countryCode,
                ecosystemRoles: profile.ecosystemRoles || [],
                streak: streakById.get(profile.id) || 0,
                avatar: profile.avatar?.id
                  ? await this.fileUrlUtils.getFileUrl(
                      profile.avatar.id,
                      this.storageService,
                    )
                  : undefined,
              }
            : null,
        };
      }),
    );
  }
}
