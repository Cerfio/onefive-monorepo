import {
  Controller,
  Get,
  HttpCode,
  Post,
  Delete,
  Query,
  Req,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { ListNetworkActivityHandler } from './handlers/list-network-activity.handler';
import { ListNetworkPeopleHandler } from './handlers/list-network-people.handler';
import { ListNetworkStartupsHandler } from './handlers/list-network-startups.handler';
import { ConnectProfileHandler } from './handlers/connect-profile.handler';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { FollowStartupHandler } from './handlers/follow-startup.handler';
import { UnfollowStartupHandler } from './handlers/unfollow-startup.handler';
import { GetNetworkActivityDto } from './dto/get-network-activity.dto';
import { GetNetworkPeopleDto } from './dto/get-network-people.dto';
import { GetNetworkStartupsDto } from './dto/get-network-startups.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { UseGuards } from '@nestjs/common';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { RelationshipStatus } from '@prisma/client';
import { ApiResponseDto } from '../common/dto';
import { AcceptConnectionHandler } from './handlers/accept-connection.handler';
import { CancelConnectionHandler } from './handlers/cancel-connection.handler';

@Controller('network')
@UseGuards(SessionGuard)
export class NetworkController {
  constructor(
    private readonly listActivityHandler: ListNetworkActivityHandler,
    private readonly listPeopleHandler: ListNetworkPeopleHandler,
    private readonly listStartupsHandler: ListNetworkStartupsHandler,
    private readonly connectProfileHandler: ConnectProfileHandler,
    private readonly acceptConnectionHandler: AcceptConnectionHandler,
    private readonly cancelConnectionHandler: CancelConnectionHandler,
    private readonly followProfileHandler: FollowProfileHandler,
    private readonly unfollowProfileHandler: UnfollowProfileHandler,
    private readonly followStartupHandler: FollowStartupHandler,
    private readonly unfollowStartupHandler: UnfollowStartupHandler,
  ) {}

  @Get('activity')
  async listActivity(
    @Req() req: FastifyRequestUserId,
    @Query(new ValidationPipe({ transform: true })) filters: GetNetworkActivityDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listActivityHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      filters,
    });
    return { success: true, data: result };
  }

  @Get('people')
  async listPeople(
    @Req() req: FastifyRequestUserId,
    @Query(new ValidationPipe({ transform: true })) filters: GetNetworkPeopleDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listPeopleHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      filters,
    });
    return { success: true, data: result };
  }

  @Get('startups')
  async listStartups(
    @Req() req: FastifyRequestUserId,
    @Query(new ValidationPipe({ transform: true })) filters: GetNetworkStartupsDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listStartupsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      filters,
    });
    return { success: true, data: result };
  }

  @Post('connect/:profileId')
  @HttpCode(200)
  async connect(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.connectProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  @Post('connect/:profileId/accept')
  @HttpCode(200)
  async acceptConnection(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.acceptConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  @Delete('connect/:profileId/cancel')
  async cancelConnection(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.cancelConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  // Deprecated endpoints removed (relationships, follows)

  @Post('follow/profile/:profileId')
  @HttpCode(200)
  async followProfile(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.followProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  @Delete('follow/profile/:profileId')
  async unfollowProfile(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.unfollowProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: result };
  }

  @Post('follow/startup/:startupId')
  @HttpCode(200)
  async followStartup(
    @Req() req: FastifyRequestUserId,
    @Param('startupId') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.followStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  @Delete('follow/startup/:startupId')
  async unfollowStartup(
    @Req() req: FastifyRequestUserId,
    @Param('startupId') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.unfollowStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }
}
