import { Injectable, NotFoundException } from '@nestjs/common';
import { PostReactionService } from '../post-reaction.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetPostReactionHandler {
  constructor(private readonly postReactionService: PostReactionService) {}

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
    const reaction = await this.postReactionService.get({
      transactionId,
      where: {
        postId_profileId: {
          postId,
          profileId: userId,
        },
      },
      select: {
        id: true,
        reaction: true,
        profileId: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Post reaction not found');
    }

    return {
      id: reaction.id,
      reaction: reaction.reaction,
      profileId: reaction.profileId,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
      profile: {
        id: (
          reaction as {
            profile?: {
              id: string;
              firstName: string;
              lastName: string;
            };
          }
        ).profile?.id,
        name: `${(reaction as { profile?: { firstName: string; lastName: string } }).profile?.firstName} ${(reaction as { profile?: { firstName: string; lastName: string } }).profile?.lastName}`,
      },
    };
  }
}
