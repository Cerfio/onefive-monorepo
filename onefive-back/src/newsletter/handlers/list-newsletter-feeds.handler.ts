import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { NewsletterFeedService } from '../newsletter-feed.service';

@Injectable()
export class ListNewsletterFeedsHandler {
  constructor(private readonly feedService: NewsletterFeedService) {}

  @Log()
  async execute() {
    const rows = await this.feedService.listFeeds();
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      feedUrl: row.feedUrl,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      itemCount: row._count.items,
    }));
  }
}
