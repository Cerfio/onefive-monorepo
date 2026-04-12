import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionUpvoteService } from '../discussion-upvote.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class CreateDiscussionUpvoteHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionUpvoteService: DiscussionUpvoteService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    discussionId,
  }: {
    transactionId: string;
    userId: string;
    discussionId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    await this.discussionUpvoteService.create({
      transactionId,
      data: {
        profile: {
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
  }
}
