import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import {
  DiscussionNotFoundException,
  DiscussionUpdateForbiddenException,
} from '../discussion.exception';
import { normalizeString } from '../../common/utils';

@Injectable()
export class UpdateDiscussionHandler {
  private static readonly EDIT_WINDOW_MS = 10 * 60 * 1000;

  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly discussionService: DiscussionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    discussionId,
    userId,
    question,
    context,
    content,
    options,
    tags,
  }: {
    transactionId: string;
    discussionId: string;
    userId: string;
    question?: string;
    context?: string;
    content?: string;
    options?: string[];
    tags?: string[];
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const existingDiscussion = await this.discussionService.get({
      transactionId,
      where: {
        id: discussionId,
      },
    });

    if (!existingDiscussion) {
      DiscussionNotFoundException.throw(this.logger, {
        transactionId,
        discussionId,
      });
    }

    if (existingDiscussion.profileId !== profile.id) {
      DiscussionUpdateForbiddenException.throw(this.logger, {
        transactionId,
        discussionId,
        profileId: profile.id,
      });
    }

    const createdAtMs = new Date(existingDiscussion.createdAt).getTime();
    const isEditWindowExpired =
      Number.isNaN(createdAtMs) ||
      Date.now() - createdAtMs > UpdateDiscussionHandler.EDIT_WINDOW_MS;

    if (isEditWindowExpired) {
      DiscussionUpdateForbiddenException.throw(this.logger, {
        transactionId,
        discussionId,
        profileId: profile.id,
        reason: 'EDIT_WINDOW_EXPIRED',
      } as any);
    }

    // Build update data
    const updateData: any = {};

    if (question !== undefined) {
      updateData.question = question;
      updateData.questionUnaccented = normalizeString(question);
    }

    if (context !== undefined) {
      updateData.context = context;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (options !== undefined) {
      updateData.options = options;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    const updatedDiscussion = await this.discussionService.update({
      transactionId,
      where: {
        id: discussionId,
      },
      data: updateData,
    });

    return updatedDiscussion;
  }
}
