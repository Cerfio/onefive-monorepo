import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerReplyReactionService } from '../discussion-answer-reply-reaction.service';
import { ProfileService } from '../../profile/profile.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class DeleteDiscussionAnswerReplyReactionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerReplyReactionService: DiscussionAnswerReplyReactionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    replyId,
    reaction,
  }: {
    transactionId: string;
    userId: string;
    replyId: string;
    reaction: ReactionType;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    return await this.discussionAnswerReplyReactionService.delete({
      transactionId,
      profileId: profile.id,
      replyId,
      reaction,
    });
  }
}
