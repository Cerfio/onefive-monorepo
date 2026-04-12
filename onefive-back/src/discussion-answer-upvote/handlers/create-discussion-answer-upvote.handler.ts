import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerUpvoteService } from '../discussion-answer-upvote.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class CreateDiscussionAnswerUpvoteHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerUpvoteService: DiscussionAnswerUpvoteService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    answerId,
  }: {
    transactionId: string;
    userId: string;
    answerId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    await this.discussionAnswerUpvoteService.create({
      transactionId,
      data: {
        profile: {
          connect: {
            id: profile.id,
          },
        },
        answer: {
          connect: {
            id: answerId,
          },
        },
      },
    });
  }
}
