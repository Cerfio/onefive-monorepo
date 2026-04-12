import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerService } from '../discussion-answer.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class CreateDiscussionAnswerHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerService: DiscussionAnswerService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    discussionId,
    content,
  }: {
    transactionId: string;
    userId: string;
    discussionId: string;
    content: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const answer = await this.discussionAnswerService.create({
      transactionId,
      data: {
        content,
        author: {
          connect: {
            id: profile.id,
          },
        },
        discussion: {
          connect: {
            id: discussionId,
          },
        },
      },
    });

    return answer;
  }
}
