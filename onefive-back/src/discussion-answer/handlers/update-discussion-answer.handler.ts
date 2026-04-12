import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerService } from '../discussion-answer.service';
import { ProfileService } from '../../profile/profile.service';
import {
  DiscussionAnswerNotFoundException,
  DiscussionAnswerUpdateForbiddenException,
} from '../discussion-answer.exception';

@Injectable()
export class UpdateDiscussionAnswerHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerService: DiscussionAnswerService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    answerId,
    content,
  }: {
    transactionId: string;
    userId: string;
    answerId: string;
    content: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const existingAnswer = await this.discussionAnswerService.get({
      transactionId,
      where: { id: answerId },
    });

    if (!existingAnswer) {
      DiscussionAnswerNotFoundException.throw(this.logger, {
        transactionId,
        answerId,
      });
    }

    if (existingAnswer.profileId !== profile.id) {
      DiscussionAnswerUpdateForbiddenException.throw(this.logger, {
        transactionId,
        answerId,
        profileId: profile.id,
      });
    }

    const updatedAnswer = await this.discussionAnswerService.update({
      transactionId,
      where: { id: answerId },
      data: { content },
    });

    return updatedAnswer;
  }
}
