import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PostService } from '../post.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdatePostDto } from '../dto/update-post.dto';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class UpdatePostHandler {
  constructor(
    private readonly postService: PostService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    postId,
    userId,
    updatePostDto,
  }: {
    transactionId: string;
    postId: string;
    userId: string;
    updatePostDto: UpdatePostDto;
  }) {
    // Check if post exists
    const existingPost = await this.postService.get({
      transactionId,
      where: { id: postId },
      select: { profileId: true, createdAt: true },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    // Check if post is still within the 15-minute edit window
    const now = new Date();
    const createdAt = new Date(existingPost.createdAt);
    const timeDifferenceMs = now.getTime() - createdAt.getTime();
    const fifteenMinutesMs = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (timeDifferenceMs > fifteenMinutesMs) {
      throw new ForbiddenException(
        'You can no longer edit this post (15-minute limit exceeded)',
      );
    }

    // Resolve current user's profile id
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (existingPost.profileId !== profile.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Update post
    const updatedPost = await this.postService.update({
      transactionId,
      where: { id: postId },
      data: {
        content: updatePostDto.content,
        medias: updatePostDto.medias as unknown as Prisma.InputJsonValue[],
        tags: updatePostDto.tags,
        repostedPost: updatePostDto.repostedPostId
          ? {
              connect: {
                id: updatePostDto.repostedPostId,
              },
            }
          : undefined,
      },
    });

    return {
      id: updatedPost.id,
      profileId: updatedPost.profileId,
      content: updatedPost.content,
      medias: updatedPost.medias,
      tags: updatedPost.tags,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    };
  }
}
