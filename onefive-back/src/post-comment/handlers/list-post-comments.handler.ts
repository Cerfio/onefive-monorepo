import { Injectable, Inject } from '@nestjs/common';
import { PostCommentService } from '../post-comment.service';
import { StreakService } from '../../streak/streak.service';
import { StorageService } from '../../storage/storage.service';
import { FollowsService } from '../../follows/follows.service';
import { Log } from '../../common/logger/logger.decorator';
import { ListPostCommentsDto } from '../dto/list-post-comments.dto';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class ListPostCommentsHandler {
  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly streakService: StreakService,
    private readonly storageService: StorageService,
    private readonly followsService: FollowsService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    postId,
    listPostCommentsDto,
    profileId,
  }: {
    transactionId: string;
    postId: string;
    listPostCommentsDto: ListPostCommentsDto;
    profileId?: string;
  }) {
    // 1) Récupérer les commentaires principaux (parentId = null)
    const mainComments = await this.postCommentService.list({
      transactionId,
      where: { postId, parentId: null },
      skip: listPostCommentsDto.skip,
      take: listPostCommentsDto.take,
      orderBy: { [listPostCommentsDto.orderBy]: listPostCommentsDto.order },
      select: {
        id: true,
        postId: true,
        parentId: true,
        profileId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            highlight: true,
            bio: true,
            countryCode: true,
            city: true,
            ecosystemRoles: true,
            avatar: {
              select: {
                id: true,
                bucket: true,
              },
            },
            _count: {
              select: {
                following: true,
                followedBy: true,
                posts: true,
              },
            },
          },
        },
        reactions: {
          select: {
            id: true,
            profileId: true,
            reaction: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });

    // 2) Récupérer les IDs des commentaires principaux
    const mainCommentIds = mainComments.map((comment: any) => comment.id);

    // 3) Récupérer tous les replies pour ces commentaires
    const replies = await this.postCommentService.list({
      transactionId,
      where: {
        postId,
        parentId: { in: mainCommentIds },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        postId: true,
        parentId: true,
        profileId: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            highlight: true,
            bio: true,
            countryCode: true,
            city: true,
            ecosystemRoles: true,
            avatar: {
              select: {
                id: true,
                bucket: true,
              },
            },
            _count: {
              select: {
                following: true,
                followedBy: true,
                posts: true,
              },
            },
          },
        },
        reactions: {
          select: {
            id: true,
            profileId: true,
            reaction: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });

    // 4) Récupérer tous les profileIds uniques pour vérifier isFollowing
    const allProfileIds = new Set<string>();
    for (const comment of mainComments as any[]) {
      if (comment.author?.id) allProfileIds.add(comment.author.id);
    }
    for (const reply of replies as any[]) {
      if (reply.author?.id) allProfileIds.add(reply.author.id);
    }

    // 5) Vérifier isFollowing pour chaque profil
    const isFollowingMap = new Map<string, boolean>();
    if (profileId) {
      await Promise.all(
        Array.from(allProfileIds).map(async (targetProfileId) => {
          if (targetProfileId === profileId) {
            isFollowingMap.set(targetProfileId, false);
          } else {
            try {
              const isFollowing = await this.followsService.isFollowingProfile({
                transactionId,
                userId: profileId,
                profileId: targetProfileId,
              });
              isFollowingMap.set(targetProfileId, isFollowing);
            } catch {
              isFollowingMap.set(targetProfileId, false);
            }
          }
        }),
      );
    }

    // 6) Grouper les replies par parentId
    const repliesByParentId: any = {};
    for (const reply of replies as any[]) {
      this.logger.debug('Processing reply', {
        id: reply.id,
        parentId: reply.parentId,
      });

      const parentId = reply.parentId;
      if (!repliesByParentId[parentId]) {
        repliesByParentId[parentId] = [];
      }
      const { aggregates: replyAggregates, userReaction: replyUserReaction } =
        this.mapReactions(reply.reactions || [], profileId);

      const avatarUrl = await this.getAvatarUrl({
        transactionId,
        avatar: reply.author?.avatar,
      });

      repliesByParentId[parentId].push({
        id: reply.id,
        postId: reply.postId,
        profileId: reply.profileId,
        author: `${reply.author?.firstName} ${reply.author?.lastName}`,
        avatar: avatarUrl,
        content: reply.content,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        reactions: Object.keys(replyAggregates).length
          ? replyAggregates
          : undefined,
        reactionCount: reply._count?.reactions || 0,
        userReaction: replyUserReaction,
        // Additional profile information for hover cards
        countryCode: reply.author?.countryCode,
        countryName: reply.author?.countryCode,
        about: reply.author?.highlight,
        bio: reply.author?.bio,
        ecosystemRoles: reply.author?.ecosystemRoles || [],
        isFollowing: isFollowingMap.get(reply.author?.id) || false,
        stats: {
          followers: reply.author?._count?.followedBy || 0,
          following: reply.author?._count?.following || 0,
          posts: reply.author?._count?.posts || 0,
        },
        streak: await this.streakService.getCurrentStreak({
          transactionId,
          userId: reply.author?.id,
        }),
        badges: [], // Placeholder - future: user badges from profile
      });
    }

    this.logger.debug('Replies grouped by parentId', {
      count: Object.keys(repliesByParentId).length,
    });

    // 7) Mapper les commentaires principaux avec leurs replies
    const result = [];
    for (const comment of mainComments as any[]) {
      const { aggregates, userReaction } = this.mapReactions(
        comment.reactions || [],
        profileId,
      );

      const avatarUrl = await this.getAvatarUrl({
        transactionId,
        avatar: comment.author?.avatar,
      });

      result.push({
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId,
        profileId: comment.profileId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author:
          `${comment.author?.firstName ?? ''} ${comment.author?.lastName ?? ''}`.trim(),
        avatar: avatarUrl,
        reactions: Object.keys(aggregates).length ? aggregates : undefined,
        reactionCount: comment._count?.reactions || 0,
        userReaction,
        replies: repliesByParentId[comment.id] || [],
        commentCount: repliesByParentId[comment.id]?.length || 0,
        // Additional profile information for hover cards
        countryCode: comment.author?.countryCode,
        countryName: comment.author?.countryCode,
        about: comment.author?.highlight,
        bio: comment.author?.bio,
        ecosystemRoles: comment.author?.ecosystemRoles || [],
        isFollowing: isFollowingMap.get(comment.author?.id) || false,
        stats: {
          followers: comment.author?._count?.followedBy || 0,
          following: comment.author?._count?.following || 0,
          posts: comment.author?._count?.posts || 0,
        },
        streak: await this.streakService.getCurrentStreak({
          transactionId,
          userId: comment.author?.id,
        }),
        badges: [], // Placeholder - future: user badges from profile
      });
    }

    this.logger.debug('Comments result', { count: result.length });
    return result;
  }

  @Log()
  private async getAvatarUrl({
    transactionId,
    avatar,
  }: {
    transactionId: string;
    avatar?: { id: string; bucket: string } | null;
  }): Promise<string> {
    if (!avatar) {
      return '';
    }

    try {
      // Return base URL without signature parameters
      const baseUrl = `${process.env.R2_PUBLIC_URL || 'http://localhost:4566'}/${avatar.bucket}/${avatar.id}`;
      return baseUrl;
    } catch (error) {
      this.logger.warn('Failed to generate avatar URL for comment', {
        transactionId,
        avatarId: avatar.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return '';
    }
  }

  private mapReactions(
    reactions: { profileId: string; reaction: string }[],
    currentProfileId?: string,
  ) {
    const aggregates: Record<string, number> = {
      like: 0,
      love: 0,
      support: 0,
      insightful: 0,
      funny: 0,
      celebrate: 0,
    };
    let userReaction: string | null = null;

    for (const r of reactions) {
      if (currentProfileId && r.profileId === currentProfileId) {
        userReaction = r.reaction ?? null;
      }
      switch (r.reaction) {
        case 'THUMBS_UP':
          aggregates.like++;
          break;
        case 'HEART':
          aggregates.love++;
          break;
        case 'COTILLON':
          aggregates.support++;
          break;
        case 'THINKING':
          aggregates.insightful++;
          break;
        case 'LAUGH':
          aggregates.funny++;
          break;
        case 'ROCKET':
          aggregates.celebrate++;
          break;
        default:
          break;
      }
    }

    // enlever les 0 pour coller au schema optional() côté front
    for (const key of Object.keys(aggregates)) {
      if (aggregates[key] === 0) delete aggregates[key];
    }

    return { aggregates, userReaction };
  }
}
