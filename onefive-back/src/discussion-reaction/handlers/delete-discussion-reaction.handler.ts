import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionReactionService } from '../discussion-reaction.service';
import { ProfileService } from '../../profile/profile.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class DeleteDiscussionReactionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionReactionService: DiscussionReactionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    discussionId,
    reaction,
  }: {
    transactionId: string;
    userId: string;
    discussionId: string;
    reaction: ReactionType;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    await this.discussionReactionService.delete({
      transactionId,
      where: {
        discussionId_profileId_reaction: {
          discussionId,
          profileId: profile.id,
          reaction,
        },
      },
    });
  }
}
