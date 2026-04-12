import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostReactionService } from '../post-reaction.service';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class DeletePostReactionHandler {
  constructor(
    private readonly postReactionService: PostReactionService,
    private readonly profileService: ProfileService,
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
    // Resolve current user's profile id
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if reaction exists and user owns it
    const existingReaction = await this.postReactionService.get({
      transactionId,
      where: {
        postId_profileId: {
          postId,
          profileId: profile.id,
        },
      },
      select: { profileId: true },
    });

    if (!existingReaction) {
      throw new NotFoundException('Post reaction not found');
    }

    if (existingReaction.profileId !== profile.id) {
      throw new ForbiddenException('You can only delete your own reactions');
    }

    // Delete reaction
    await this.postReactionService.delete({
      transactionId,
      where: {
        postId_profileId: {
          postId,
          profileId: profile.id,
        },
      },
    });

    return { message: 'Post reaction deleted successfully' };
  }
}
