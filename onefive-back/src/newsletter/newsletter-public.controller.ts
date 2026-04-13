import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UpdateNewsletterPreferencesDto } from './dto/update-newsletter-preferences.dto';
import { GetNewsletterPreferencesHandler } from './handlers/newsletter-preferences.handler';
import { UpdateNewsletterPreferencesHandler } from './handlers/newsletter-preferences.handler';
import { SubscribeNewsletterHandler } from './handlers/subscribe-newsletter.handler';
import { UnsubscribeNewsletterHandler } from './handlers/unsubscribe-newsletter.handler';

/**
 * Public newsletter endpoints — no authentication.
 * Token-based access only (token is emailed to the subscriber).
 */
@Public()
@Controller('newsletter')
export class NewsletterPublicController {
  constructor(
    private readonly subscribeHandler: SubscribeNewsletterHandler,
    private readonly getPreferencesHandler: GetNewsletterPreferencesHandler,
    private readonly updatePreferencesHandler: UpdateNewsletterPreferencesHandler,
    private readonly unsubscribeHandler: UnsubscribeNewsletterHandler,
  ) {}

  /** Subscribe a new email address. */
  @Post('subscribe')
  async subscribe(@Body() body: SubscribeNewsletterDto) {
    const data = await this.subscribeHandler.execute(body);
    return { success: true, data };
  }

  /** Read preferences for a token (used by the landing-page preferences page). */
  @Get('preferences/:token')
  async getPreferences(@Param('token') token: string) {
    const data = await this.getPreferencesHandler.execute(token);
    return { success: true, data };
  }

  /** Update frequency preference. */
  @Patch('preferences/:token')
  async updatePreferences(
    @Param('token') token: string,
    @Body() body: UpdateNewsletterPreferencesDto,
  ) {
    const data = await this.updatePreferencesHandler.execute(token, body);
    return { success: true, data };
  }

  /** Unsubscribe — one-click from email. */
  @Post('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    const data = await this.unsubscribeHandler.execute(token);
    return { success: true, data };
  }
}
