import { Injectable, Inject } from '@nestjs/common';
import { MessagingService } from '../messaging.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class ListConversationsHandler {
  constructor(
    private readonly messagingService: MessagingService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
    limit,
    skip,
    search,
  }: {
    transactionId: string;
    profileId: string;
    limit?: number;
    skip?: number;
    search?: string;
  }) {
    return this.messagingService.listConversations({
      transactionId,
      profileId,
      limit,
      skip,
      search,
    });
  }
}
