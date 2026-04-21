import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerService } from '../discussion-answer.service';
import { ProfileService } from '../../profile/profile.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';

@Injectable()
export class CreateDiscussionAnswerHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionAnswerService: DiscussionAnswerService,
    private readonly profileService: ProfileService,
    private readonly notificationHelper: NotificationHelperService,
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
      select: { id: true, firstName: true, lastName: true },
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

    // Notify the discussion author (fire-and-forget; don't block the response)
    this.notificationHelper
      .notifyDiscussionAnswer({
        discussionId,
        answerId: answer.id,
        actorProfileId: profile.id,
        actorName: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() ||
          'Someone',
      })
      .catch((err) => {
        this.logger.error('Failed to notify discussion author of new answer', {
          transactionId,
          discussionId,
          answerId: answer.id,
          error: err instanceof Error ? err.message : 'Unknown',
        });
      });

    return answer;
  }
}
