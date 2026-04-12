import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionService } from '../discussion.service';
import { DiscussionViewService } from '../../discussion-view/discussion-view.service';
import { ProfileService } from '../../profile/profile.service';
import { ProfileFollowService } from '../../profile-follow/profile-follow.service';
import { StreakService } from '../../streak/streak.service';
import { DiscussionNotFoundException } from '../discussion.exception';
import { DiscussionType } from '@prisma/client';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';

@Injectable()
export class GetDiscussionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionService: DiscussionService,
    private readonly discussionViewService: DiscussionViewService,
    private readonly profileService: ProfileService,
    private readonly profileFollowService: ProfileFollowService,
    private readonly storageService: StorageService,
    private readonly streakService: StreakService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    discussionId,
    userId,
  }: {
    transactionId: string;
    discussionId: string;
    userId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const discussion = await this.discussionService.get({
      transactionId,
      where: {
        id: discussionId,
      },
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
        // nbr of views, upvotes, answers
        _count: {
          select: {
            views: true,
            upvotes: true,
            answers: true,
          },
        },
        // if discussion liked by user
        upvotes: {
          where: {
            profileId: profile.id,
          },
          select: {
            id: true,
          },
        },
        // poll votes for this discussion
        pollVotes: {
          select: {
            option: true,
            profileId: true,
          },
        },
        answers: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            profileId: true,
            // if answer liked by user
            upvotes: {
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                upvotes: true,
              },
            },
            reactions: {
              select: {
                profileId: true,
                reaction: true,
              },
            },
            replies: {
              select: {
                profileId: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                id: true,
                reactions: {
                  select: {
                    profileId: true,
                    reaction: true,
                  },
                },
                upvotes: {
                  select: {
                    profileId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!discussion) {
      DiscussionNotFoundException.throw(this.logger, {
        transactionId,
        discussionId,
      });
    }

    // Create view for this discussion
    await this.discussionViewService.create({
      transactionId,
      data: {
        viewer: {
          connect: {
            id: profile.id,
          },
        },
        discussion: {
          connect: {
            id: discussion.id,
          },
        },
      },
    });

    // Enrichir avec les profils des auteurs (discussion + answers + replies)
    const allProfileIds = [
      discussion.profileId,
      ...(discussion.answers || []).map((answer: any) => answer.profileId),
      ...(discussion.answers || []).flatMap((answer: any) =>
        (answer.replies || []).map((reply: any) => reply.profileId),
      ),
    ];
    const uniqueProfileIds = Array.from(new Set(allProfileIds));

    const profiles = await this.profileService.list({
      transactionId,
      where: { id: { in: uniqueProfileIds } },
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

    // Batch isFollowing — 1 requête au lieu de N
    const otherProfileIds = uniqueProfileIds.filter((id) => id !== profile.id);
    const followingSet = await this.profileFollowService.areFollowingBatch(
      profile.id,
      otherProfileIds,
    );
    const isFollowingMap = new Map<string, boolean>();
    for (const id of uniqueProfileIds) {
      isFollowingMap.set(id, id === profile.id ? false : followingSet.has(id));
    }

    const profileById = new Map(profiles.map((p: any) => [p.id, p]));

    // Pré-calculer les URLs d'avatar pour tous les profils
    const avatarUrlMap = new Map<string, string | undefined>();
    await Promise.all(
      profiles.map(async (p: any) => {
        if (p.avatar?.id) {
          const url = await this.fileUrlUtils.getFileUrl(
            p.avatar.id,
            this.storageService,
          );
          avatarUrlMap.set(p.id, url);
        }
      }),
    );

    // Batch streaks — 1 requête au lieu de N
    const streakById = await this.streakService.getCurrentStreakBatch({
      transactionId,
      userIds: uniqueProfileIds,
    });

    const enrichProfile = (profileId: string) => {
      const p = profileById.get(profileId);
      if (!p) return null;
      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        createdAt: p.createdAt,
        bio: p.bio,
        highlight: p.highlight,
        followedBy: p._count?.followedBy || 0,
        following: p._count?.following || 0,
        postsCount: p._count?.posts || 0,
        isFollowing: isFollowingMap.get(profileId) || false,
        countryCode: p.countryCode,
        ecosystemRoles: p.ecosystemRoles || [],
        streak: streakById.get(profileId) || 0,
        avatar: avatarUrlMap.get(profileId),
      };
    };

    // Calculer les résultats de vote pour les sondages
    let pollResults: Record<string, number> = {};
    let hasVoted = false;
    if (
      discussion.type === DiscussionType.POLL ||
      discussion.type === DiscussionType.POLL_MULTIPLE
    ) {
      // Compter les votes par option
      const votesByOption = new Map<string, number>();
      const pollVotes = (discussion as any).pollVotes as
        | Array<{ option: string; profileId: string }>
        | undefined;
      pollVotes?.forEach((vote) => {
        votesByOption.set(
          vote.option,
          (votesByOption.get(vote.option) || 0) + 1,
        );
      });
      pollResults = Object.fromEntries(votesByOption);

      // Vérifier si l'utilisateur a déjà voté
      hasVoted =
        pollVotes?.some((vote) => vote.profileId === profile.id) || false;
    }

    return {
      ...discussion,
      profile: enrichProfile(discussion.profileId),
      pollResults,
      hasVoted,
      answers: (discussion.answers || []).map((answer: any) => ({
        ...answer,
        profile: enrichProfile(answer.profileId),
        replies: (answer.replies || []).map((reply: any) => ({
          ...reply,
          profile: enrichProfile(reply.profileId),
        })),
      })),
    };
  }
}
