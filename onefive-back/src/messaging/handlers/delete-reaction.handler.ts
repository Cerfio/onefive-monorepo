import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class DeleteReactionHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
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
    return this.messagingService.deleteReaction({
      transactionId,
      profileId,
      messageId,
      emoji,
    });
  }
}
