import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { FeedExtraService } from '../feed-extra.service';

@Injectable()
export class ToggleBookmarkHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly feedExtraService: FeedExtraService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    postId,
  }: {
    transactionId: string;
    userId: string;
    postId: string;
  }): Promise<{ bookmarked: boolean }> {
    this.logger.info('Toggling bookmark', {
      transactionId,
      userId,
      postId,
    });

    return await this.feedExtraService.toggleBookmark({
      transactionId,
      userId,
      postId,
    });
  }
}
