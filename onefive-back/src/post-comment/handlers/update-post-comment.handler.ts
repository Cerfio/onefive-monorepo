import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostCommentService } from '../post-comment.service';
import { ProfileService } from '../../profile/profile.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdatePostCommentDto } from '../dto/update-post-comment.dto';

@Injectable()
export class UpdatePostCommentHandler {
  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    commentId,
    userId,
    updatePostCommentDto,
  }: {
    transactionId: string;
    commentId: string;
    userId: string;
    updatePostCommentDto: UpdatePostCommentDto;
  }) {
    // Check if comment exists and user owns it
    const existingComment = await this.postCommentService.get({
      transactionId,
      where: { id: commentId },
      select: { profileId: true, createdAt: true },
    });

    if (!existingComment) {
      throw new NotFoundException('Post comment not found');
    }

    // Check if comment is still within the 15-minute edit window
    const now = new Date();
    const createdAt = new Date(existingComment.createdAt);
    const timeDifferenceMs = now.getTime() - createdAt.getTime();
    const fifteenMinutesMs = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (timeDifferenceMs > fifteenMinutesMs) {
      throw new ForbiddenException(
        'You can no longer edit this comment (15-minute limit exceeded)',
      );
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
      throw new ForbiddenException('You can only update your own comments');
    }

    // Update comment
    const updatedComment = await this.postCommentService.update({
      transactionId,
      where: { id: commentId },
      data: { content: updatePostCommentDto.content },
    });

    return {
      id: updatedComment.id,
      postId: updatedComment.postId,
      parentId: updatedComment.parentId,
      profileId: updatedComment.profileId,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
    };
  }
}
