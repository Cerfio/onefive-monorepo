import { Inject, Injectable } from '@nestjs/common';
import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { PostService } from '../../post/post.service';
import { ProfileService } from '../../profile/profile.service';
import { StreakService } from '../../streak/streak.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ListProfilePostsDto } from '../dto/list-profile-posts.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto';

type PostReaction = {
  id: string;
  profileId: string;
  reaction: string;
  createdAt: Date;
};

@Injectable()
export class ListProfilePostsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly postService: PostService,
    private readonly profileService: ProfileService,
    private readonly streakService: StreakService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    authProfileId,
    profileId,
    query,
  }: {
    transactionId: string;
    authProfileId: string;
    profileId: string;
    query: ListProfilePostsDto;
  }) {
    const take = query.take ?? 20;
    const posts = await this.prisma.post.findMany({
      where: { profileId },
      skip: query.skip,
      take: take + 1,
      orderBy: { [query.orderBy]: query.order },
      select: {
        id: true,
        profileId: true,
        content: true,
        medias: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        repostedPostId: true,
        reactions: {
          select: {
            id: true,
            profileId: true,
            reaction: true,
            createdAt: true,
          },
        },
        bookmarks: authProfileId
          ? {
              where: { profileId: authProfileId },
              select: { id: true },
            }
          : undefined,
        reposts: authProfileId
          ? {
              where: { profileId: authProfileId },
              select: { id: true },
            }
          : undefined,
        _count: {
          select: {
            comments: { where: { parentId: null } },
            reactions: true,
            views: true,
            reposts: true,
          },
        },
      },
    });

    // Récupérer les informations du profil de l'auteur
    const authors = await this.profileService.list({
      transactionId,
      where: { id: profileId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        highlight: true,
        countryCode: true,
        ecosystemRoles: true,
        createdAt: true,
        avatar: {
          select: {
            id: true,
            bucket: true,
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
    const author = authors[0];

    // Récupérer la streak de l'auteur
    const streak = await this.streakService.getCurrentStreak({
      transactionId,
      userId: profileId,
    });

    // Récupérer l'avatar URL
    let avatarUrl = '';
    if (author?.avatar) {
      try {
        // Return base URL without signature parameters (same as PostService.getAvatarUrl)
        avatarUrl = `${process.env.R2_PUBLIC_URL || 'http://localhost:4566'}/${author.avatar.bucket}/${author.avatar.id}`;
      } catch (error) {
        this.logger.warn('Failed to get avatar URL', { transactionId, error });
        avatarUrl = '';
      }
    }

    // Vérifier si l'utilisateur connecté suit l'auteur
    let isFollowing = false;
    if (authProfileId !== profileId) {
      const follow = await this.prisma.profileFollow.findFirst({
        where: {
          followingId: authProfileId,
          followedById: profileId,
        },
      });
      isFollowing = !!follow;
    }

    // Mapping des types de réaction backend vers frontend
    const reactionTypeMapping: Record<string, string> = {
      THUMBS_UP: 'like',
      HEART: 'love',
      COTILLON: 'support',
      THINKING: 'insightful',
      LAUGH: 'funny',
      ROCKET: 'celebrate',
      THUMBS_DOWN: 'thumbs_down',
      SMILE: 'smile',
      EYES: 'eyes',
      CRY: 'cry',
    };

    const hasMore = posts.length > take;
    const postsPage = posts.slice(0, take);

    const items = postsPage.map((p: any) => {
      const userReaction = p.reactions?.find(
        (r: PostReaction) => r.profileId === authProfileId,
      );

      // Calculer les réactions par type
      const reactionsByType: Record<string, number> = {};
      p.reactions?.forEach((r: PostReaction) => {
        const reactionType = r.reaction;
        const mappedType =
          reactionTypeMapping[reactionType] || reactionType.toLowerCase();
        reactionsByType[mappedType] = (reactionsByType[mappedType] || 0) + 1;
      });

      // Filtrer les URLs de médias vides
      // Handle both string format (legacy) and object format (new) with url property
      const validMediaUrls = (p.medias || [])
        .map((media: any) => {
          // If it's an object with a url property, use that
          if (typeof media === 'object' && media?.url) {
            return media.url;
          }
          // If it's a string, use it directly
          if (typeof media === 'string') {
            return media;
          }
          return null;
        })
        .filter(
          (url: string | null): url is string =>
            url !== null && typeof url === 'string' && url.trim().length > 0,
        );

      return {
        id: p.id,
        author: {
          id: profileId,
          name: `${author?.firstName ?? ''} ${author?.lastName ?? ''}`.trim(),
          about: author?.bio ?? '',
          highlight: author?.highlight ?? null,
          avatar: avatarUrl,
          streak,
          countryCode: author?.countryCode ?? null,
          ecosystemRoles: author?.ecosystemRoles ?? [],
          createdAt:
            author?.createdAt?.toISOString() ?? new Date().toISOString(),
          followers: author?._count?.followedBy ?? 0,
          following: author?._count?.following ?? 0,
          posts: author?._count?.posts ?? 0,
          isFollowing,
        },
        content: p.content,
        mediaUrls: validMediaUrls,
        tags: p.tags || [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || p.createdAt,
        reactions: reactionsByType,
        reactionCount: p._count?.reactions ?? 0,
        commentCount: p._count?.comments ?? 0,
        repostCount: p._count?.reposts ?? 0,
        isReposted: (p as any).reposts && (p as any).reposts.length > 0,
        isBookmarked: (p as any).bookmarks && (p as any).bookmarks.length > 0,
        userReaction: userReaction
          ? reactionTypeMapping[userReaction.reaction] ||
            userReaction.reaction.toLowerCase()
          : null,
        displayReason: 'your_post' as const,
      };
    });

    return new PaginatedResponseDto({
      items,
      page: Math.floor((query.skip ?? 0) / take) + 1,
      pageSize: take,
      hasMore,
    });
  }
}
