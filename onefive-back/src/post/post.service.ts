import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Post, Prisma } from '@prisma/client';
import {
  PostCreateException,
  PostGetException,
  PostListException,
  PostUpdateException,
  PostDeleteException,
} from './post.exception';
import { ProfileService } from '../profile/profile.service';
import { StreakService } from '../streak/streak.service';
import { StorageService } from '../storage/storage.service';
import { PaginatedResponseDto } from '../common/dto';

import { FEED_MIX_CONFIG } from './post-feed.config';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly streakService: StreakService,
    private readonly storageService: StorageService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.PostCreateInput;
  }): Promise<Post> {
    try {
      return await this.prisma.post.create({
        data,
      });
    } catch (error) {
      PostCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
    select,
  }: {
    transactionId: string;
    where: Prisma.PostWhereUniqueInput;
    select?: Prisma.PostSelect;
  }): Promise<Post | null> {
    try {
      return await this.prisma.post.findUnique({
        where,
        select,
      });
    } catch (error) {
      PostGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async list({
    transactionId,
    where,
    select,
    orderBy,
    skip,
    take,
  }: {
    transactionId: string;
    where?: Prisma.PostWhereInput;
    select?: Prisma.PostSelect;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Post[]> {
    try {
      return await this.prisma.post.findMany({
        where,
        select,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      PostListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  /**
   * Remonte récursivement jusqu'au post original pour récupérer ses tags
   * @param postId L'ID du post à partir duquel remonter
   * @param maxDepth Profondeur maximale pour éviter les boucles infinies
   * @returns Les tags du post original
   */
  private async getOriginalPostTags(
    postId: string,
    maxDepth: number = 10,
    currentDepth: number = 0,
  ): Promise<string[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        tags: true,
        repostedPostId: true,
      },
    });

    if (!post) {
      return [];
    }

    // Si ce n'est pas un repost, retourner ses tags
    if (!post.repostedPostId) {
      return post.tags || [];
    }

    // Sinon, remonter au post parent
    return this.getOriginalPostTags(
      post.repostedPostId,
      maxDepth,
      currentDepth + 1,
    );
  }

  /**
   * Fusionne les tags du post actuel avec ceux du post original (sans doublons)
   * @param currentTags Les tags du post actuel
   * @param originalPostId L'ID du post original (si c'est un repost)
   * @returns Les tags fusionnés
   */
  private async mergeTagsWithOriginal(
    currentTags: string[],
    originalPostId?: string | null,
  ): Promise<string[]> {
    if (!originalPostId) {
      return currentTags || [];
    }

    const originalTags = await this.getOriginalPostTags(originalPostId);

    // Fusionner les tags sans doublons (garder l'ordre : tags actuels d'abord, puis tags originaux)
    const mergedTags = [...(currentTags || [])];
    originalTags.forEach((tag) => {
      if (!mergedTags.includes(tag)) {
        mergedTags.push(tag);
      }
    });

    return mergedTags;
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
  }: {
    transactionId: string;
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    try {
      return await this.prisma.post.update({
        where,
        data,
      });
    } catch (error) {
      PostUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.PostWhereUniqueInput;
  }): Promise<Post> {
    try {
      return await this.prisma.post.delete({
        where,
      });
    } catch (error) {
      PostDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async listWithEnrichment({
    transactionId,
    authId,
    skip,
    limit,
    tags,
  }: {
    transactionId: string;
    authId: string;
    skip: number;
    limit: number;
    tags?: string[];
  }) {
    try {
      // 1) Résoudre le profile courant depuis authId
      const profiles = await this.profileService.list({
        transactionId,
        where: { userId: authId },
        select: { id: true },
        take: 1,
      });
      const viewer = profiles[0];
      const viewerId = viewer?.id as string;

      if (!viewerId) {
        const posts = await this.prisma.post.findMany({
          skip,
          take: limit + 1,
          where: {
            isHidden: false,
            ...(tags && tags.length > 0
              ? { tags: { hasSome: tags } }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            profileId: true,
            content: true,
            medias: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
            repostedPostId: true,
            repostedPost: {
              select: {
                id: true,
                profileId: true,
                content: true,
                medias: true,
                tags: true,
                createdAt: true,
                repostedPostId: true, // Ajouter pour vérifier si B est aussi un repost
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                      select: {
                        id: true,
                        bucket: true,
                      },
                    },
                  },
                },
              },
            },
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

        // Enrichir les auteurs
        const authorProfileIds = Array.from(
          new Set(posts.map((p: { profileId: string }) => p.profileId)),
        );
        const authors = await this.profileService.list({
          transactionId,
          where: { id: { in: authorProfileIds } },
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
        const authorById = new Map(authors.map((a: any) => [a.id, a]));

        // Batch streaks — 1 query au lieu de N
        const streakMap = await this.streakService.getCurrentStreakBatch({
          transactionId,
          userIds: authorProfileIds,
        });

        const noProfileHasMore = posts.length > limit;
        const postsPage = posts.slice(0, limit);

        const items = postsPage.map(async (p: any) => {
          const author = authorById.get(p.profileId);
          const streak = streakMap.get(p.profileId) || 0;
          const avatarUrl = await this.getAvatarUrl({
            transactionId,
            avatar: author?.avatar,
          });

          let repostedPost = null;
          if (p.repostedPost) {
            const repostedAuthorAvatarUrl = await this.getAvatarUrl({
              transactionId,
              avatar: p.repostedPost.author?.avatar,
            });
            const isRepost = !!p.repostedPost.repostedPostId;
            repostedPost = {
              id: p.repostedPost.id,
              author: {
                id: p.repostedPost.profileId,
                name: `${p.repostedPost.author?.firstName ?? ''} ${p.repostedPost.author?.lastName ?? ''}`.trim(),
                avatar: repostedAuthorAvatarUrl,
              },
              content: p.repostedPost.content,
              mediaUrls: p.repostedPost.medias || [],
              tags: p.repostedPost.tags || [],
              createdAt: p.repostedPost.createdAt,
              isRepost,
            };
          }

          const mergedTags = await this.mergeTagsWithOriginal(
            p.tags || [],
            p.repostedPostId,
          );

          return {
            id: p.id,
            author: {
              id: p.profileId,
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
              isFollowing: false,
            },
            content: p.content,
            mediaUrls: p.medias || [],
            tags: mergedTags,
            reactions: undefined,
            reactionCount: p._count?.reactions ?? 0,
            commentCount: p._count?.comments ?? 0,
            repostCount: p._count?.reposts ?? 0,
            isReposted: false,
            isBookmarked: false,
            userReaction: null,
            displayReason: 'new_content' as const,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt || p.createdAt,
            repostedPost,
          };
        });

        const resolvedItems = await Promise.all(items);
        return new PaginatedResponseDto({
          items: resolvedItems,
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          hasMore: noProfileHasMore,
        });
      }

      // 2) Déterminer les IDs des posts à afficher
      let postIds: string[] = [];
      const displayReasons = new Map<string, string>();

      let tagHasMore: boolean | null = null;

      if (tags && tags.length > 0) {
        const filtered = await this.prisma.post.findMany({
          skip,
          take: limit + 1,
          where: {
            isHidden: false,
            tags: { hasSome: tags },
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });
        tagHasMore = filtered.length > limit;
        postIds = filtered.slice(0, limit).map((p) => p.id);
      } else {
        // === LOGIQUE FEED MIX ===

        // 1. Posts déjà vus
        const viewed = await this.prisma.postView.findMany({
          where: { profileId: viewerId },
          select: { postId: true },
        });
        const viewedPostIds = viewed.map((v) => v.postId);

        // 2. Fetch par catégories
        const quotaConfig = FEED_MIX_CONFIG.quotas;
        const ratio = limit / FEED_MIX_CONFIG.PAGE_SIZE;
        const categories = FEED_MIX_CONFIG.fallbackOrder;
        const results: Record<string, any[]> = {};

        // Fetch parallèle des catégories
        await Promise.all(
          categories.map(async (cat) => {
            const target = Math.ceil((quotaConfig as any)[cat] * ratio) || 1;
            let posts: any[] = [];

            switch (cat) {
              case 'RELATION':
                posts = await this.getRelationPosts(
                  viewerId,
                  viewedPostIds,
                  target,
                );
                break;
              case 'FOLLOWED_HASHTAG':
                posts = await this.getFollowedHashtagPosts(
                  viewerId,
                  viewedPostIds,
                  target,
                );
                break;
              case 'TRENDING':
                posts = await this.getTrendingPosts(
                  viewerId,
                  viewedPostIds,
                  target,
                );
                break;
              case 'LOCATION_BASED':
                posts = await this.getLocationBasedPosts(
                  viewerId,
                  viewedPostIds,
                  target,
                );
                break;
            }

            results[cat] = posts;
          }),
        );

        // 3. Round Robin Mixing
        const finalMix: any[] = [];
        const pool = { ...results };

        while (finalMix.length < limit) {
          let added = false;
          for (const cat of categories) {
            if (finalMix.length >= limit) break;
            if (pool[cat] && pool[cat].length > 0) {
              const post = pool[cat].shift();
              if (!finalMix.some((p) => p.id === post.id)) {
                post.displayReason = cat.toLowerCase();
                finalMix.push(post);
                added = true;
              }
            }
          }
          if (!added) break;
        }

        // 4. Fallback si quota non atteint
        if (finalMix.length < limit) {
          const extras = await this.getEmptyFeedFallback(viewerId, limit);
          const currentIds = new Set(finalMix.map((p) => p.id));

          for (const p of extras) {
            if (finalMix.length >= limit) break;
            if (!currentIds.has(p.id) && !viewedPostIds.includes(p.id)) {
              (p as any).displayReason = 'recommendation';
              finalMix.push(p);
              currentIds.add(p.id);
            }
          }

          // 5. Fallback ultime (Feed vide ou tout vu)
          if (finalMix.length === 0) {
            const fallback = await this.getEmptyFeedFallback(viewerId, limit);
            for (const p of fallback) {
              if (finalMix.length >= limit) break;
              if (!currentIds.has(p.id)) {
                (p as any).displayReason = 'recommendation';
                finalMix.push(p);
                currentIds.add(p.id);
              }
            }
          }
        }

        postIds = finalMix.map((p) => p.id);
        finalMix.forEach((p) => {
          displayReasons.set(p.id, p.displayReason || 'new_content');
        });

        // 6. Enregistrer les vues (fire-and-forget, idempotent via skipDuplicates)
        if (postIds.length > 0) {
          this.prisma.postView
            .createMany({
              data: postIds.map((id) => ({
                postId: id,
                profileId: viewerId,
              })),
              skipDuplicates: true,
            })
            .catch((err) => {
              this.logger.warn('Failed to record post views', {
                transactionId,
                error: err instanceof Error ? err.message : String(err),
              });
            });
        }
      }

      if (postIds.length === 0) {
        return new PaginatedResponseDto({
          items: [],
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          hasMore: false,
        });
      }

      // 3) Récupérer les posts enrichis
      const posts = await this.prisma.post.findMany({
        where: { id: { in: postIds } },
        select: {
          id: true,
          profileId: true,
          content: true,
          medias: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          repostedPostId: true,
          repostedPost: {
            select: {
              id: true,
              profileId: true,
              content: true,
              medias: true,
              tags: true,
              createdAt: true,
              repostedPostId: true, // Ajouter pour vérifier si B est aussi un repost
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: {
                    select: {
                      id: true,
                      bucket: true,
                    },
                  },
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
          bookmarks: {
            where: { profileId: viewerId },
            select: { id: true },
          },
          reposts: {
            where: { profileId: viewerId },
            select: { id: true },
          },
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

      // Re-order to match mix order
      const postsMap = new Map(posts.map((p) => [p.id, p]));
      const orderedPosts = postIds
        .map((id) => postsMap.get(id))
        .filter(Boolean) as typeof posts;

      // 4) Enrichir les auteurs via Profile
      const authorProfileIds = Array.from(
        new Set(orderedPosts.map((p) => p.profileId)),
      );
      const authors = await this.profileService.list({
        transactionId,
        where: { id: { in: authorProfileIds } },
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
      const authorById = new Map(authors.map((a: any) => [a.id, a]));

      // Batch follow check — 1 query au lieu de N
      const otherAuthorIds = authorProfileIds.filter((id) => id !== viewerId);
      const follows =
        otherAuthorIds.length > 0
          ? await this.prisma.profileFollow.findMany({
              where: {
                followingId: viewerId,
                followedById: { in: otherAuthorIds },
              },
              select: { followedById: true },
            })
          : [];
      const followingSet = new Set(follows.map((f) => f.followedById));

      // 5) Batch streaks — 1 query au lieu de N
      const streakMap = await this.streakService.getCurrentStreakBatch({
        transactionId,
        userIds: authorProfileIds,
      });

      // 6) Mapper vers le schéma front
      const items = orderedPosts.map(async (p: any) => {
        const author = authorById.get(p.profileId);
        const { aggregates, userReaction } = this.mapReactions(
          p.reactions || [],
          viewerId,
        );
        const streak = streakMap.get(p.profileId) || 0;
        const avatarUrl = await this.getAvatarUrl({
          transactionId,
          avatar: author?.avatar,
        });
        const isFollowing = followingSet.has(p.profileId);

        let reason = displayReasons.get(p.id);
        if (p.profileId === viewerId) reason = 'your_post';

        // Si c'est un repost, récupérer les infos du post direct (B)
        let repostedPost = null;
        if (p.repostedPost) {
          const repostedAuthorAvatarUrl = await this.getAvatarUrl({
            transactionId,
            avatar: p.repostedPost.author?.avatar,
          });
          // Vérifier si le repost a lui-même un repost (pour l'indicateur visuel)
          const isRepost = !!p.repostedPost.repostedPostId;
          repostedPost = {
            id: p.repostedPost.id,
            author: {
              id: p.repostedPost.profileId,
              name: `${p.repostedPost.author?.firstName ?? ''} ${p.repostedPost.author?.lastName ?? ''}`.trim(),
              avatar: repostedAuthorAvatarUrl,
            },
            content: p.repostedPost.content,
            mediaUrls: p.repostedPost.medias || [],
            tags: p.repostedPost.tags || [],
            createdAt: p.repostedPost.createdAt,
            isRepost, // Flag pour indiquer que B est aussi un repost
          };
        }

        // Fusionner les tags avec ceux du post original
        const mergedTags = await this.mergeTagsWithOriginal(
          p.tags || [],
          p.repostedPostId,
        );

        return {
          id: p.id,
          author: {
            id: p.profileId,
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
          mediaUrls: p.medias || [],
          tags: mergedTags,
          reactions: Object.keys(aggregates).length ? aggregates : undefined,
          reactionCount: p._count?.reactions ?? 0,
          commentCount: p._count?.comments ?? 0,
          repostCount: p._count?.reposts ?? 0,
          isReposted: p.reposts && p.reposts.length > 0,
          isBookmarked: p.bookmarks && p.bookmarks.length > 0,
          userReaction,
          displayReason: reason || 'new_content',
          createdAt: p.createdAt,
          updatedAt: p.updatedAt || p.createdAt,
          repostedPost,
        };
      });

      const resolvedItems = await Promise.all(items);

      let hasMore: boolean;
      if (tagHasMore !== null) {
        hasMore = tagHasMore;
      } else {
        // Mix feed: probe for remaining unseen posts
        const allViewedNow = [
          ...(await this.prisma.postView
            .findMany({
              where: { profileId: viewerId },
              select: { postId: true },
            })
            .then((rows) => rows.map((r) => r.postId))),
          ...postIds,
        ];
        const uniqueViewed = [...new Set(allViewedNow)];
        const remaining = await this.prisma.post.count({
          where: { isHidden: false, id: { notIn: uniqueViewed } },
        });
        hasMore = remaining > 0;
      }

      return new PaginatedResponseDto({
        items: resolvedItems,
        page: Math.floor(skip / limit) + 1,
        pageSize: limit,
        hasMore,
      });
    } catch (error) {
      PostListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async getAvatarUrl({
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
      this.logger.warn('Failed to generate avatar URL', {
        transactionId,
        avatarId: avatar.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return '';
    }
  }

  private mapReactions(
    reactions: { profileId: string; reaction: string }[],
    currentProfileId: string,
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
      if (r.profileId === currentProfileId) {
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

  private async getRelationPosts(
    viewerId: string,
    viewedPostIds: string[],
    limit: number,
  ) {
    // 1. Get profiles followed by user
    const following = await this.prisma.profileFollow.findMany({
      where: { followingId: viewerId },
      select: { followedById: true },
    });
    const followingIds = following.map((f) => f.followedById);

    if (followingIds.length === 0) return [];

    // 2. Get posts from these profiles
    return this.prisma.post.findMany({
      where: {
        isHidden: false,
        profileId: { in: followingIds },
        id: { notIn: viewedPostIds },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, profileId: true, createdAt: true },
    });
  }

  private async getFollowedHashtagPosts(
    viewerId: string,
    viewedPostIds: string[],
    limit: number,
  ) {
    // 1. Get tags followed by user
    const followedTags = await this.prisma.tagFollow.findMany({
      where: { profileId: viewerId },
      select: { name: true },
    });
    const tagNames = followedTags.map((t) => t.name);

    if (tagNames.length === 0) return [];

    // 2. Get posts with these tags (including own posts)
    return this.prisma.post.findMany({
      where: {
        isHidden: false,
        tags: { hasSome: tagNames },
        id: { notIn: viewedPostIds },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, profileId: true, createdAt: true },
    });
  }

  private async getTrendingPosts(
    viewerId: string,
    viewedPostIds: string[],
    limit: number,
  ) {
    // Trending: recent posts with interactions (including own posts)
    // Simplified: recent posts ordered by reaction count
    // Ideally we would have a calculated score
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Last 7 days

    return this.prisma.post.findMany({
      where: {
        isHidden: false,
        createdAt: { gte: cutoffDate },
        id: { notIn: viewedPostIds },
      },
      orderBy: [
        { reactions: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
      ],
      take: limit,
      select: { id: true, profileId: true, createdAt: true },
    });
  }

  private async getLocationBasedPosts(
    viewerId: string,
    viewedPostIds: string[],
    limit: number,
  ) {
    // 1. Get user location
    const userProfile = await this.prisma.profile.findUnique({
      where: { id: viewerId },
      select: { countryCode: true, city: true },
    });

    if (!userProfile?.countryCode) return [];

    // 2. Priorité : même pays + même ville
    const locationFilter: any = {
      isHidden: false,
      author: {
        countryCode: userProfile.countryCode,
        ...(userProfile.city ? { city: userProfile.city } : {}),
      },
      id: { notIn: viewedPostIds },
    };

    let posts = await this.prisma.post.findMany({
      where: locationFilter,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, profileId: true, createdAt: true },
    });

    // 3. Fallback : même pays seulement si pas assez de résultats ville+pays
    if (posts.length < limit && userProfile.city) {
      const existingIds = posts.map((p) => p.id);
      const countryOnly = await this.prisma.post.findMany({
        where: {
          isHidden: false,
          author: {
            countryCode: userProfile.countryCode,
          },
          id: { notIn: [...viewedPostIds, ...existingIds] },
        },
        orderBy: { createdAt: 'desc' },
        take: limit - posts.length,
        select: { id: true, profileId: true, createdAt: true },
      });
      posts = [...posts, ...countryOnly];
    }

    return posts;
  }

  private async getEmptyFeedFallback(viewerId: string, limit: number) {
    return this.prisma.post.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      take: limit * 3,
      select: { id: true, profileId: true, createdAt: true },
    });
  }

  /**
   * Get a single post with full enrichment (same format as feed items)
   */
  @Log()
  async getWithEnrichment({
    transactionId,
    postId,
    authId,
  }: {
    transactionId: string;
    postId: string;
    authId: string;
  }) {
    try {
      // 1) Résoudre le profile courant depuis authId
      const profiles = await this.profileService.list({
        transactionId,
        where: { userId: authId },
        select: { id: true },
        take: 1,
      });
      const viewer = profiles[0];
      const viewerId = viewer?.id as string;

      // 2) Récupérer le post enrichi
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          profileId: true,
          content: true,
          medias: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          repostedPostId: true,
          repostedPost: {
            select: {
              id: true,
              profileId: true,
              content: true,
              medias: true,
              tags: true,
              createdAt: true,
              repostedPostId: true, // Ajouter pour vérifier si B est aussi un repost
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: {
                    select: {
                      id: true,
                      bucket: true,
                    },
                  },
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
          bookmarks: viewerId
            ? {
                where: { profileId: viewerId },
                select: { id: true },
              }
            : undefined,
          reposts: viewerId
            ? {
                where: { profileId: viewerId },
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

      if (!post) {
        return null;
      }

      // 3) Enrichir l'auteur via Profile
      const authors = await this.profileService.list({
        transactionId,
        where: { id: post.profileId },
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
      const author = authors[0] as any;

      // Check if viewer is following the author
      let isFollowing = false;
      if (viewerId && post.profileId !== viewerId) {
        const follow = await this.prisma.profileFollow.findFirst({
          where: {
            followingId: viewerId,
            followedById: post.profileId,
          },
        });
        isFollowing = !!follow;
      }

      // 4) Récupérer la streak de l'auteur
      const streak = await this.streakService.getCurrentStreak({
        transactionId,
        userId: post.profileId,
      });

      // 5) Mapper les réactions
      const { aggregates, userReaction } = this.mapReactions(
        post.reactions || [],
        viewerId || '',
      );

      // 6) Générer l'URL de l'avatar
      const avatarUrl = await this.getAvatarUrl({
        transactionId,
        avatar: author?.avatar,
      });

      // 7) Déterminer la raison d'affichage
      let displayReason = 'new_content';
      if (viewerId && post.profileId === viewerId) {
        displayReason = 'your_post';
      }

      // 8) Si c'est un repost, récupérer les infos du post direct (B)
      let repostedPost = null;
      if ((post as any).repostedPost) {
        const repostedAuthorAvatarUrl = await this.getAvatarUrl({
          transactionId,
          avatar: (post as any).repostedPost.author?.avatar,
        });
        // Vérifier si le repost a lui-même un repost (pour l'indicateur visuel)
        const isRepost = !!(post as any).repostedPost.repostedPostId;
        repostedPost = {
          id: (post as any).repostedPost.id,
          author: {
            id: (post as any).repostedPost.profileId,
            name: `${(post as any).repostedPost.author?.firstName ?? ''} ${(post as any).repostedPost.author?.lastName ?? ''}`.trim(),
            avatar: repostedAuthorAvatarUrl,
          },
          content: (post as any).repostedPost.content,
          mediaUrls: (post as any).repostedPost.medias || [],
          tags: (post as any).repostedPost.tags || [],
          createdAt: (post as any).repostedPost.createdAt,
          isRepost, // Flag pour indiquer que B est aussi un repost
        };
      }

      // Fusionner les tags avec ceux du post original
      const mergedTags = await this.mergeTagsWithOriginal(
        post.tags || [],
        post.repostedPostId,
      );

      return {
        id: post.id,
        author: {
          id: post.profileId,
          name: `${author?.firstName ?? ''} ${author?.lastName ?? ''}`.trim(),
          about: author?.bio ?? '',
          highlight: author?.highlight ?? null,
          avatar: avatarUrl,
          streak: streak || 0,
          countryCode: author?.countryCode ?? null,
          ecosystemRoles: author?.ecosystemRoles ?? [],
          createdAt:
            author?.createdAt?.toISOString() ?? new Date().toISOString(),
          followers: author?._count?.followedBy ?? 0,
          following: author?._count?.following ?? 0,
          posts: author?._count?.posts ?? 0,
          isFollowing,
        },
        content: post.content,
        mediaUrls: post.medias || [],
        tags: mergedTags,
        reactions: Object.keys(aggregates).length ? aggregates : undefined,
        reactionCount: post._count?.reactions ?? 0,
        commentCount: post._count?.comments ?? 0,
        repostCount: post._count?.reposts ?? 0,
        isReposted: (post as any).reposts && (post as any).reposts.length > 0,
        isBookmarked:
          (post as any).bookmarks && (post as any).bookmarks.length > 0,
        userReaction,
        displayReason,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt || post.createdAt,
        repostedPost,
      };
    } catch (error) {
      PostGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
