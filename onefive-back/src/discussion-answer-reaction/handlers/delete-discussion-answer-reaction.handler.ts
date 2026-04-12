import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerReactionService } from '../discussion-answer-reaction.service';
import { ProfileService } from '../../profile/profile.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class DeleteDiscussionAnswerReactionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerReactionService: DiscussionAnswerReactionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    answerId,
    reaction,
  }: {
    transactionId: string;
    userId: string;
    answerId: string;
    reaction: ReactionType;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    return await this.discussionAnswerReactionService.delete({
      transactionId,
      profileId: profile.id,
      answerId,
      reaction,
    });
  }
}
