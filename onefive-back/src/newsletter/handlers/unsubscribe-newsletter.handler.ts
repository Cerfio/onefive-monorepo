import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { NewsletterSubscriberService } from '../newsletter-subscriber.service';

@Injectable()
export class UnsubscribeNewsletterHandler {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Log()
  execute(token: string) {
    return this.subscriberService.unsubscribe(token);
  }
}
