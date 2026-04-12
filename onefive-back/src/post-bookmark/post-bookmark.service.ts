import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookmarkedPostResponseDto } from './dto/get-post-bookmark.dto';

@Injectable()
export class PostBookmarkService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async get({
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
        throw new NotFoundException('User profile not found');
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

      return bookmarks.map((bookmark) => {
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
          },
          mediaUrls: post.medias as any[],
        };
      });
    } catch (error) {
      this.logger.error('Failed to get bookmarks', { transactionId, error });
      throw error;
    }
  }

  @Log()
  async create({
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
        throw new NotFoundException('User profile not found');
      }

      // Check if post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if bookmark already exists
      const existingBookmark = await this.prisma.postBookmark.findUnique({
        where: {
          postId_profileId: {
            postId,
            profileId: userProfile.id,
          },
        },
      });

      if (existingBookmark) {
        return { bookmarked: true }; // Already bookmarked
      }

      // Create bookmark
      await this.prisma.postBookmark.create({
        data: {
          postId,
          profileId: userProfile.id,
        },
      });

      return { bookmarked: true };
    } catch (error) {
      this.logger.error('Failed to create bookmark', { transactionId, error });
      throw error;
    }
  }

  @Log()
  async delete({
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
        throw new NotFoundException('User profile not found');
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

      if (!existingBookmark) {
        return { bookmarked: false }; // Already not bookmarked
      }

      // Delete bookmark
      await this.prisma.postBookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      return { bookmarked: false };
    } catch (error) {
      this.logger.error('Failed to delete bookmark', { transactionId, error });
      throw error;
    }
  }

  @Log()
  async toggle({
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
        throw new NotFoundException('User profile not found');
      }

      // Check if post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
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
      this.logger.error('Failed to toggle bookmark', { transactionId, error });
      throw error;
    }
  }
}
