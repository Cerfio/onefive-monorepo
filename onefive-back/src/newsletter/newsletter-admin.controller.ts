import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ADMIN_PERMISSIONS } from 'src/admin/admin.constants';
import { RequireAdminPermissions } from 'src/admin/admin.decorators';
import { AdminPermissionGuard } from 'src/admin/guards/admin-permission.guard';
import { AdminSessionGuard } from 'src/admin/guards/admin-session.guard';
import { CreateNewsletterFeedDto } from './dto/create-newsletter-feed.dto';
import { RunNewsletterIngestionDto } from './dto/run-newsletter-ingestion.dto';
import { CreateNewsletterFeedHandler } from './handlers/create-newsletter-feed.handler';
import { ListNewsletterFeedsHandler } from './handlers/list-newsletter-feeds.handler';
import { ListNewsletterSubscribersHandler } from './handlers/list-newsletter-subscribers.handler';
import { RunNewsletterIngestionHandler } from './handlers/run-newsletter-ingestion.handler';

@Public()
@Controller('admin/newsletter')
@UseGuards(AdminSessionGuard, AdminPermissionGuard)
export class NewsletterAdminController {
  constructor(
    private readonly createFeedHandler: CreateNewsletterFeedHandler,
    private readonly listFeedsHandler: ListNewsletterFeedsHandler,
    private readonly listSubscribersHandler: ListNewsletterSubscribersHandler,
    private readonly runIngestionHandler: RunNewsletterIngestionHandler,
  ) {}

  // ── Feeds ──────────────────────────────────────────────────────────────

  @Get('feeds')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_NEWSLETTER_MANAGE)
  async listFeeds() {
    const data = await this.listFeedsHandler.execute();
    return { success: true, data };
  }

  @Post('feeds')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_NEWSLETTER_MANAGE)
  async createFeed(@Body() body: CreateNewsletterFeedDto) {
    const data = await this.createFeedHandler.execute(body);
    return { success: true, data };
  }

  // ── Ingestion ──────────────────────────────────────────────────────────

  @Post('ingestion/run')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_NEWSLETTER_MANAGE)
  async runIngestion(@Body() body: RunNewsletterIngestionDto) {
    const data = await this.runIngestionHandler.execute(body);
    return { success: true, data };
  }

  // ── Subscribers ────────────────────────────────────────────────────────

  @Get('subscribers')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_NEWSLETTER_MANAGE)
  async listSubscribers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const data = await this.listSubscribersHandler.execute(
      skip ? parseInt(skip, 10) : 0,
      take ? Math.min(parseInt(take, 10), 200) : 50,
    );
    return { success: true, data };
  }
}
