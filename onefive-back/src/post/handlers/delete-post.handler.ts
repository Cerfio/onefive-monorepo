import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostService } from '../post.service';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileService } from '../../profile/profile.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class DeletePostHandler {
  constructor(
    private readonly postService: PostService,
    private readonly profileService: ProfileService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    postId,
    userId,
  }: {
    transactionId: string;
    postId: string;
    userId: string;
  }) {
    // Check if post exists
    const existingPost = await this.postService.get({
      transactionId,
      where: { id: postId },
      select: { profileId: true },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
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
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Delete post
    await this.postService.delete({
      transactionId,
      where: { id: postId },
    });

    this.posthogService.capture(userId, 'post_deleted', { post_id: postId });

    return { message: 'Post deleted successfully' };
  }
}
