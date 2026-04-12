import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class MarkAsReadHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    conversationId,
    messageId,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    messageId?: string;
  }) {
    return this.messagingService.markAsRead({
      transactionId,
      profileId,
      conversationId,
      messageId,
    });
  }
}
