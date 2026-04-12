import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetConversationMessagesHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    conversationId,
    limit,
    cursor,
    direction,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    limit?: number;
    cursor?: string;
    direction?: 'before' | 'after';
  }) {
    return this.messagingService.getMessages({
      transactionId,
      profileId,
      conversationId,
      limit,
      cursor,
      direction,
    });
  }
}
