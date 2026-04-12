import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUrlUtils } from '../common/utils';
import { StorageService } from '../storage/storage.service';
import {
  FeedExtraGetException,
  FeedExtraCreateException,
  FeedExtraNotFoundException,
} from './feed-extra.exception';
import { ProfileSuggestionResponseDto } from './dto/get-profile-suggestions.dto';
import { StartupSuggestionResponseDto } from './dto/get-startup-suggestions.dto';
import { ProfileStatisticsResponseDto } from './dto/get-profile-statistics.dto';
import {
  BookmarkedPostResponseDto,
  PostMediaResponse,
} from './dto/bookmarks.dto';

@Injectable()
export class FeedExtraService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async getProfileSuggestions({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<ProfileSuggestionResponseDto[]> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Get profiles not followed by the user, excluding self
      const profiles = await this.prisma.profile.findMany({
        where: {
          AND: [
            { userId: { not: userId } },
            {
              followedBy: {
                none: {
                  followingId: userProfile.id,
                },
              },
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
          bio: true,
          highlight: true,
          ecosystemRoles: true,
          skills: true,
          countryCode: true,
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          // Random ordering for suggestions - in production you'd want better algorithm
          { createdAt: 'desc' },
        ],
      });

      // Process avatars in parallel
      const profilesWithAvatars = await Promise.all(
        profiles.map(async (profile) => ({
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                profile.avatar.id,
                this.storageService,
              )
            : undefined,
          bio: profile.bio || undefined,
          highlight: profile.highlight || undefined,
          followersCount: profile._count.followedBy,
          isFollowed: false, // We already filtered out followed profiles
          ecosystemRoles: profile.ecosystemRoles,
          skills: profile.skills,
          countryCode: profile.countryCode || undefined,
        })),
      );

      return profilesWithAvatars;
    } catch (error) {
      // Re-throw known exceptions
      throw error;
    }
  }

  @Log()
  async getStartupSuggestions({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<StartupSuggestionResponseDto[]> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Get startups not followed by the user
      const startups = await this.prisma.startup.findMany({
        where: {
          followedBy: {
            none: {
              profileId: userProfile.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          categories: true,
          countryCode: true,
          city: true,
          _count: {
            select: {
              members: true,
              followedBy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          // Random ordering for suggestions - in production you'd want better algorithm
          { createdAt: 'desc' },
        ],
      });

      return startups.map((startup) => ({
        id: startup.id,
        name: startup.name,
        description: startup.description || undefined,
        categories: startup.categories,
        countryCode: startup.countryCode,
        city: startup.city,
        membersCount: startup._count.members,
        followersCount: startup._count.followedBy,
        isFollowed: false, // We already filtered out followed startups
      }));
    } catch (error) {
      // Re-throw known exceptions
      throw error;
    }
  }

  @Log()
  async getProfileStatistics({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<ProfileStatisticsResponseDto> {
    try {
      // Get user's profile with related data
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: {
          id: true,
          _count: {
            select: {
              following: true,
              posts: true,
              postViews: true,
              postReactions: true,
              postComments: true,
            },
          },
        },
      });

      if (!userProfile) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Get user's streak
      const streakCount = await this.prisma.streak.count({
        where: { userId },
      });

      // Calculate statistics
      const postsCreated = userProfile._count.posts;
      const totalReactions = userProfile._count.postReactions;
      const totalComments = userProfile._count.postComments;
      const postsViewed = userProfile._count.postViews;
      const connections = userProfile._count.following;

      // Calculate engagement rate (simplified formula)
      const engagement =
        postsCreated > 0
          ? Math.round(((totalReactions + totalComments) / postsCreated) * 10)
          : 0;

      // Calculate level based on total activity (simplified formula)
      const totalActivity = postsCreated + totalReactions + totalComments;
      const level = Math.floor(totalActivity / 10) + 1;
      const experience = (totalActivity % 10) * 10; // Progress to next level

      return {
        postsViewed,
        engagement: Math.min(engagement, 100), // Cap at 100%
        connections,
        level,
        experience,
        streak: streakCount,
        postsCreated,
        totalReactions,
        totalComments,
      };
    } catch (error) {
      // Re-throw known exceptions
      throw error;
    }
  }

  @Log()
  async getBookmarks({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<BookmarkedPostResponseDto[]> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Get bookmarked posts
      const bookmarks = await this.prisma.postBookmark.findMany({
        where: {
          profileId: userProfile.id,
        },
        include: {
          post: {
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
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      // Process bookmarks with avatars in parallel
      const bookmarksWithAvatars = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const post = bookmark.post;
          const content = post.content || '';
          const excerpt =
            content.length > 150 ? content.substring(0, 150) + '...' : content;

          return {
            id: post.id,
            title: content.split('\n')[0] || 'Post sans titre',
            content: post.content,
            excerpt,
            bookmarkedAt: bookmark.createdAt.toISOString(),
            tags: post.tags,
            author: {
              id: post.author.id,
              firstName: post.author.firstName,
              lastName: post.author.lastName,
              avatar: post.author.avatar?.id
                ? await this.fileUrlUtils.getFileUrl(
                    post.author.avatar.id,
                    this.storageService,
                  )
                : undefined,
            },
            mediaUrls: (post.medias as unknown as PostMediaResponse[]) || [],
          };
        }),
      );

      return bookmarksWithAvatars;
    } catch (error) {
      // Re-throw known exceptions
      throw error;
    }
  }

  @Log()
  async toggleBookmark({
    transactionId,
    userId,
    postId,
  }: {
    transactionId: string;
    userId: string;
    postId: string;
  }): Promise<{ bookmarked: boolean }> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Check if post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        FeedExtraNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Check if bookmark exists
      const existingBookmark = await this.prisma.postBookmark.findUnique({
        where: {
          postId_profileId: {
            postId,
            profileId: userProfile.id,
          },
        },
      });

      if (existingBookmark) {
        // Remove bookmark
        await this.prisma.postBookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });
        return { bookmarked: false };
      } else {
        // Add bookmark
        await this.prisma.postBookmark.create({
          data: {
            postId,
            profileId: userProfile.id,
          },
        });
        return { bookmarked: true };
      }
    } catch (error) {
      // Re-throw known exceptions
      throw error;
    }
  }
}
