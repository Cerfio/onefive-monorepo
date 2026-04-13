import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { NewsletterSubscriberService } from '../newsletter-subscriber.service';

@Injectable()
export class ListNewsletterSubscribersHandler {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Log()
  async execute(skip = 0, take = 50) {
    const [items, total] = await Promise.all([
      this.subscriberService.listAll(skip, take),
      this.subscriberService.countActive(),
    ]);
    return { items, total, skip, take };
  }
}
