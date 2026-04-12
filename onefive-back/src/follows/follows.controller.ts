import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { FollowStartupHandler } from './handlers/follow-startup.handler';
import { UnfollowStartupHandler } from './handlers/unfollow-startup.handler';
import { FollowProfileDto } from './dto/follow-profile.dto';
import { FollowStartupDto } from './dto/follow-startup.dto';
import { FollowResponseDto } from './dto/follows-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { UseGuards } from '@nestjs/common';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';

@Controller('follows')
@UseGuards(SessionGuard)
@Throttle({
  short: { limit: 3, ttl: 1000 },
  medium: { limit: 20, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
}) // 30 follow/unfollow per min
export class FollowsController {
  constructor(
    private readonly followProfileHandler: FollowProfileHandler,
    private readonly unfollowProfileHandler: UnfollowProfileHandler,
    private readonly followStartupHandler: FollowStartupHandler,
    private readonly unfollowStartupHandler: UnfollowStartupHandler,
  ) {}

  @Post('profiles')
  async followProfile(
    @Req() req: FastifyRequestUserId,
    @Body() body: FollowProfileDto,
  ): Promise<ApiResponseDto<FollowResponseDto>> {
    const result = await this.followProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId: body.profileId,
    });
    return { success: true, data: result };
  }

  @Delete('profiles/:profileId')
  async unfollowProfile(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<FollowResponseDto>> {
    const result = await this.unfollowProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  @Post('startups')
  async followStartup(
    @Req() req: FastifyRequestUserId,
    @Body() body: FollowStartupDto,
  ): Promise<ApiResponseDto<FollowResponseDto>> {
    const result = await this.followStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId: body.startupId,
    });
    return { success: true, data: result };
  }

  @Delete('startups/:startupId')
  async unfollowStartup(
    @Req() req: FastifyRequestUserId,
    @Param('startupId') startupId: string,
  ): Promise<ApiResponseDto<FollowResponseDto>> {
    const result = await this.unfollowStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  // Deprecated: follows listing removed, use enriched payloads
}
