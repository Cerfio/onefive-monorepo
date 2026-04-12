import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class UpdateMessageHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    messageId,
    content,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
    content: string;
  }) {
    return this.messagingService.updateMessage({
      transactionId,
      profileId,
      messageId,
      content,
    });
  }
}
