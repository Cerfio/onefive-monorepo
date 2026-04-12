import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class SendMessageHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    conversationId,
    content,
    type,
    replyToId,
    attachmentId,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    content?: string;
    type?: string;
    replyToId?: string;
    attachmentId?: string;
  }) {
    const result = await this.messagingService.sendMessage({
      transactionId,
      profileId,
      conversationId,
      content,
      type,
      replyToId,
      attachmentId,
    });
    this.posthogService.capture(profileId, 'message_sent', {
      conversation_id: conversationId,
    });
    return result;
  }
}
