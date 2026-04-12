import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { GetVisitorsAnalyticsHandler } from './handlers/get-visitors-analytics.handler';
import { GetEngagementAnalyticsHandler } from './handlers/get-engagement-analytics.handler';
import { GetOverviewAnalyticsHandler } from './handlers/get-overview-analytics.handler';
import {
  VisitorsAnalyticsResponseDto,
  GetVisitorsAnalyticsQueryDto,
  TimeRange,
} from './dto/get-visitors-analytics.dto';
import {
  EngagementAnalyticsResponseDto,
  GetEngagementAnalyticsQueryDto,
} from './dto/get-engagement-analytics.dto';
import {
  OverviewAnalyticsResponseDto,
  GetOverviewAnalyticsQueryDto,
} from './dto/get-overview-analytics.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';

@Controller('profile-analytics')
@UseGuards(SessionGuard)
export class ProfileAnalyticsController {
  constructor(
    private readonly getVisitorsAnalyticsHandler: GetVisitorsAnalyticsHandler,
    private readonly getEngagementAnalyticsHandler: GetEngagementAnalyticsHandler,
    private readonly getOverviewAnalyticsHandler: GetOverviewAnalyticsHandler,
  ) {}

  @Get('overview')
  async getOverview(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetOverviewAnalyticsQueryDto,
  ): Promise<{ success: true; data: OverviewAnalyticsResponseDto }> {
    const overview = await this.getOverviewAnalyticsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      timeRange: query.timeRange as TimeRange,
    });
    return { success: true, data: overview };
  }

  @Get('visitors')
  async getVisitors(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetVisitorsAnalyticsQueryDto,
  ): Promise<{ success: true; data: VisitorsAnalyticsResponseDto }> {
    const visitors = await this.getVisitorsAnalyticsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      timeRange: query.timeRange as TimeRange,
    });
    return { success: true, data: visitors };
  }

  @Get('engagement')
  async getEngagement(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetEngagementAnalyticsQueryDto,
  ): Promise<{ success: true; data: EngagementAnalyticsResponseDto }> {
    const engagement = await this.getEngagementAnalyticsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      timeRange: query.timeRange as TimeRange,
      skip: query.skip,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return { success: true, data: engagement };
  }
}
