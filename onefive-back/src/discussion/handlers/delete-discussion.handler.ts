import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import {
  DiscussionNotFoundException,
  DiscussionUpdateForbiddenException,
} from '../discussion.exception';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class DeleteDiscussionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionService: DiscussionService,
    private readonly profileService: ProfileService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    discussionId,
    userId,
  }: {
    transactionId: string;
    discussionId: string;
    userId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const discussion = await this.discussionService.get({
      transactionId,
      where: {
        id: discussionId,
      },
    });

    if (!discussion) {
      DiscussionNotFoundException.throw(this.logger, {
        transactionId,
        discussionId,
      });
    }

    if (discussion.profileId !== profile.id) {
      DiscussionUpdateForbiddenException.throw(this.logger, {
        transactionId,
        discussionId,
        profileId: profile.id,
      });
    }

    await this.discussionService.delete({
      transactionId,
      where: {
        id: discussionId,
      },
    });

    this.posthogService.capture(userId, 'discussion_deleted', {
      discussion_id: discussionId,
    });

    return true;
  }
}
