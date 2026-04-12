import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerReplyUpvoteService } from '../discussion-answer-reply-upvote.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class CreateDiscussionAnswerReplyUpvoteHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerReplyUpvoteService: DiscussionAnswerReplyUpvoteService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    replyId,
  }: {
    transactionId: string;
    userId: string;
    replyId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    await this.discussionAnswerReplyUpvoteService.create({
      transactionId,
      data: {
        profile: {
          connect: {
            id: profile.id,
          },
        },
        reply: {
          connect: {
            id: replyId,
          },
        },
      },
    });
  }
}
