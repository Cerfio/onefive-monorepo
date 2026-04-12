import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateConversationHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    participantIds,
    name,
    type,
    initialMessage,
  }: {
    transactionId: string;
    profileId: string;
    participantIds: string[];
    name?: string;
    type?: 'DIRECT' | 'GROUP';
    initialMessage?: string;
  }) {
    const result = await this.messagingService.createConversation({
      transactionId,
      profileId,
      participantIds,
      name,
      type,
      initialMessage,
    });
    this.posthogService.capture(profileId, 'conversation_created', {
      participant_count: participantIds.length,
      type,
    });
    return result;
  }
}
