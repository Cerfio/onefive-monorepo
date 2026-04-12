import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PostBookmarkService } from '../post-bookmark.service';

@Injectable()
export class CreatePostBookmarkHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly postBookmarkService: PostBookmarkService,
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
    return await this.postBookmarkService.create({
      transactionId,
      userId,
      postId,
    });
  }
}
