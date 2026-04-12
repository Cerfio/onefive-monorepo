import {
  Controller,
  HttpCode,
  Post,
  Delete,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ProfileFollowService } from './profile-follow.service';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { IsFollowingProfileHandler } from './handlers/is-following-profile.handler';
import { ListFollowersHandler } from './handlers/list-followers.handler';
import { ListFollowingHandler } from './handlers/list-following.handler';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto';

@Controller('profiles')
export class ProfileFollowController {
  constructor(
    private readonly followProfileHandler: FollowProfileHandler,
    private readonly unfollowProfileHandler: UnfollowProfileHandler,
    private readonly isFollowingProfileHandler: IsFollowingProfileHandler,
    private readonly listFollowersHandler: ListFollowersHandler,
    private readonly listFollowingHandler: ListFollowingHandler,
  ) {}

  @Post(':profileId/follow')
  @HttpCode(200)
  async follow(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.followProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Delete(':profileId/follow')
  async unfollow(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.unfollowProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Get(':profileId/is-following')
  async isFollowing(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<{ isFollowing: boolean }>> {
    const { isFollowing } = await this.isFollowingProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: { isFollowing } };
  }

  @Get(':profileId/followers')
  async listFollowers(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const followers = await this.listFollowersHandler.execute({
      transactionId: req.id,
      profileId,
    });
    return { success: true, data: followers };
  }

  @Get(':profileId/following')
  async listFollowing(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const following = await this.listFollowingHandler.execute({
      transactionId: req.id,
      profileId,
    });
    return { success: true, data: following };
  }
}
