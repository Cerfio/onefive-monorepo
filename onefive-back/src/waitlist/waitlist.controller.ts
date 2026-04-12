import {
  Controller,
  Get,
  Req,
  Query,
  Put,
  Param,
  Post,
  NotFoundException,
} from '@nestjs/common';
import {
  WaitlistStatusResponseDto,
  WaitlistLeaderboardResponseDto,
  ToggleLeaderboardOptInResponseDto,
  GetReferrerByCodeResponseDto,
  GetMyReferrerResponseDto,
} from './dto/waitlist-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { GetWaitlistStatusHandler } from './handlers/get-waitlist-status.handler';
import { GetWaitlistLeaderboardHandler } from './handlers/get-waitlist-leaderboard.handler';
import { ToggleLeaderboardOptInHandler } from './handlers/toggle-leaderboard-opt-in.handler';
import { GetReferrerByCodeHandler } from './handlers/get-referrer-by-code.handler';
import { GetMyReferrerHandler } from './handlers/get-my-referrer.handler';
import { SelfActivateWaitlistHandler } from './handlers/self-activate-waitlist.handler';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { Public } from '../common/decorators/public.decorator';
import { AllowWaitlistNotActive } from '../common/decorators/allow-waitlist-not-active.decorator';

@Controller('waitlist')
export class WaitlistController {
  constructor(
    private readonly getStatusHandler: GetWaitlistStatusHandler,
    private readonly getLeaderboardHandler: GetWaitlistLeaderboardHandler,
    private readonly toggleLeaderboardOptInHandler: ToggleLeaderboardOptInHandler,
    private readonly getReferrerByCodeHandler: GetReferrerByCodeHandler,
    private readonly getMyReferrerHandler: GetMyReferrerHandler,
    private readonly selfActivateHandler: SelfActivateWaitlistHandler,
  ) {}

  /**
   * Get current user's waitlist status, position, referral code, badges, etc.
   */
  @AllowWaitlistNotActive()
  @Get('status')
  async getStatus(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<WaitlistStatusResponseDto>> {
    const result = await this.getStatusHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Get waitlist leaderboard - top referrers
   */
  @AllowWaitlistNotActive()
  @Get('leaderboard')
  async getLeaderboard(
    @Req() req: FastifyRequestUserId,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<WaitlistLeaderboardResponseDto>> {
    const result = await this.getLeaderboardHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return { success: true, data: result };
  }

  /**
   * Toggle showInLeaderboard (opt-in/opt-out)
   */
  @AllowWaitlistNotActive()
  @Put('leaderboard-opt-in')
  async toggleLeaderboardOptIn(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<ToggleLeaderboardOptInResponseDto>> {
    const result = await this.toggleLeaderboardOptInHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Get referrer by referral code (ambassador or user). Single request for signup banner.
   * Public endpoint - used BEFORE signup when user has a referral code.
   */
  @Public()
  @Get('referrer/:code')
  async getReferrerByCode(
    @Req() req: FastifyRequestUserId,
    @Param('code') code: string,
  ): Promise<ApiResponseDto<GetReferrerByCodeResponseDto>> {
    const result = await this.getReferrerByCodeHandler.execute({
      transactionId: req.id,
      referralCode: code,
    });
    return { success: true, data: result };
  }

  /**
   * Get my referrer info (for logged-in user). Uses referrerId stored in profile.
   * Returns null if user has no referrer.
   */
  @AllowWaitlistNotActive()
  @Get('my-referrer')
  async getMyReferrer(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<GetMyReferrerResponseDto>> {
    const result = await this.getMyReferrerHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Self-activate current user from waitlist (DEV ONLY).
   * Triggers: DB update (ACTIVE), activation email, Early Adopter badge if eligible.
   * Returns 404 when NODE_ENV !== 'development'.
   */
  @AllowWaitlistNotActive()
  @Post('self-activate')
  async selfActivate(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<{ message: string }>> {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }
    const result = await this.selfActivateHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }
}
