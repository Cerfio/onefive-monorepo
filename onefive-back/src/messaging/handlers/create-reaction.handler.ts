import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateReactionHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    messageId,
    emoji,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
    emoji: string;
  }) {
    const result = await this.messagingService.createReaction({
      transactionId,
      profileId,
      messageId,
      emoji,
    });
    this.posthogService.capture(profileId, 'message_reaction_created', {
      message_id: messageId,
      emoji,
    });
    return result;
  }
}
