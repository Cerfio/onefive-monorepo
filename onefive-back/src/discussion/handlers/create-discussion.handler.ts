import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionType } from '@prisma/client';
import { DiscussionService } from '../discussion.service';
import { normalizeString } from '../../common/utils';
import { ProfileService } from '../../profile/profile.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateDiscussionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionService: DiscussionService,
    private readonly profileService: ProfileService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    content,
    context,
    question,
    type,
    options,
    tags,
  }: {
    transactionId: string;
    userId: string;
    content?: string;
    context?: string;
    question: string;
    type: DiscussionType;
    options: string[];
    tags: string[];
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const discussion = await this.discussionService.create({
      transactionId,
      data: {
        author: {
          connect: {
            id: profile.id,
          },
        },
        content: content || '',
        context: context || undefined,
        question,
        questionUnaccented: normalizeString(question),
        type,
        options: type === 'DISCUSSION' ? [] : options,
        tags,
      },
    });

    this.posthogService.capture(userId, 'discussion_created', {
      discussion_type: type,
    });

    return discussion;
  }
}
