import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostCommentService } from '../post-comment.service';
import { ProfileService } from '../../profile/profile.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class DeletePostCommentHandler {
  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    commentId,
    userId,
  }: {
    transactionId: string;
    commentId: string;
    userId: string;
  }) {
    // Check if comment exists and user owns it
    const existingComment = await this.postCommentService.get({
      transactionId,
      where: { id: commentId },
      select: { profileId: true },
    });

    if (!existingComment) {
      throw new NotFoundException('Post comment not found');
    }

    // Get the profile to check ownership
    const profile = await this.profileService.get({
      transactionId,
      where: { id: existingComment.profileId },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Comment author profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete comment
    await this.postCommentService.delete({
      transactionId,
      where: { id: commentId },
    });

    return { message: 'Post comment deleted successfully' };
  }
}
