import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import type { CreateNewsletterFeedDto } from '../dto/create-newsletter-feed.dto';
import { NewsletterFeedService } from '../newsletter-feed.service';

@Injectable()
export class CreateNewsletterFeedHandler {
  constructor(private readonly feedService: NewsletterFeedService) {}

  @Log()
  execute(dto: CreateNewsletterFeedDto) {
    return this.feedService.createFeed(dto);
  }
}
