import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import type { SubscribeNewsletterDto } from '../dto/subscribe-newsletter.dto';
import { NewsletterSubscriberService } from '../newsletter-subscriber.service';

@Injectable()
export class SubscribeNewsletterHandler {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Log()
  async execute(dto: SubscribeNewsletterDto) {
    return this.subscriberService.subscribe(dto.email);
  }
}
