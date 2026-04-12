import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PostBookmarkService } from '../post-bookmark.service';
import { BookmarkedPostResponseDto } from '../dto/get-post-bookmark.dto';

@Injectable()
export class GetPostBookmarkHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly postBookmarkService: PostBookmarkService,
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
    return await this.postBookmarkService.get({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
