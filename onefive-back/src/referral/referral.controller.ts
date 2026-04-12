import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { GetReferralStatsHandler } from './handlers/get-stats.handler';
import { GetLeaderboardHandler } from './handlers/get-leaderboard.handler';
import { ListMyReferralsHandler } from './handlers/list-my-referrals.handler';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { AllowOnboardingNotComplete } from '../common/decorators/allow-onboarding-not-complete.decorator';
import { ApiResponseDto } from '../common/dto';

@Controller('referral')
@UseGuards(SessionGuard)
export class ReferralController {
  constructor(
    private readonly getStatsHandler: GetReferralStatsHandler,
    private readonly getLeaderboardHandler: GetLeaderboardHandler,
    private readonly listMyReferralsHandler: ListMyReferralsHandler,
  ) {}

  /**
   * Récupérer les stats de parrainage de l'utilisateur connecté
   */
  @AllowOnboardingNotComplete()
  @Get('stats')
  async getStats(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getStatsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Récupérer le leaderboard des parrains
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Req() req: FastifyRequestUserId,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getLeaderboardHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: limit ? parseInt(limit, 10) : 10,
    });
    return { success: true, data: result };
  }

  /**
   * Récupérer mes parrainages
   */
  @AllowOnboardingNotComplete()
  @Get('my-referrals')
  async listMyReferrals(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listMyReferralsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }
}
