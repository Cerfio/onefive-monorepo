import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import type { UpdateNewsletterPreferencesDto } from '../dto/update-newsletter-preferences.dto';
import { NewsletterSubscriberService } from '../newsletter-subscriber.service';

@Injectable()
export class GetNewsletterPreferencesHandler {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Log()
  execute(token: string) {
    return this.subscriberService.getByToken(token);
  }
}

@Injectable()
export class UpdateNewsletterPreferencesHandler {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Log()
  execute(token: string, dto: UpdateNewsletterPreferencesDto) {
    if (!dto.frequency) return this.subscriberService.getByToken(token);
    return this.subscriberService.updatePreferences(token, dto.frequency);
  }
}
