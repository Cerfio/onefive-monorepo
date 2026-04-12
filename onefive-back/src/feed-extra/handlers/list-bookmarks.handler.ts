import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { FeedExtraService } from '../feed-extra.service';
import { BookmarkedPostResponseDto } from '../dto/bookmarks.dto';

@Injectable()
export class ListBookmarksHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly feedExtraService: FeedExtraService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<BookmarkedPostResponseDto[]> {
    this.logger.info('Listing bookmarks', {
      transactionId,
      userId,
      limit,
      skip,
    });

    return await this.feedExtraService.getBookmarks({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
