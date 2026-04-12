import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProfileHandler } from './handlers/create-profile.handler';
import { SelfProfileHandler } from './handlers/self-profile.handler';
import { GetProfileHandler } from './handlers/get-profile.handler';
import { CreateProfileBodyDto } from './dto/create-profile.dto';
import { GetProfileParamDto } from './dto/get-profile.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';

import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { MeProfileHandler } from './handlers/me-profile.handler';
import { UpdateProfileHandler } from './handlers/update-profile.handler';
import { UpdateSkillsInterestsHandler } from './handlers/update-skills-interests.handler';
import { BatchUpdateAchievementsHandler } from './handlers/batch-update-achievements.handler';
import { SearchProfilesHandler } from './handlers/search-profiles.handler';
import {
  UpdateProfileDto,
  UpdateSkillsInterestsDto,
} from './dto/update-profile.dto';
import { BatchUpdateAchievementsDto } from './dto/achievement.dto';
import { AllowOnboardingNotComplete } from '../common/decorators/allow-onboarding-not-complete.decorator';
import { AllowWaitlistNotActive } from '../common/decorators/allow-waitlist-not-active.decorator';
import {
  ProfileResponseDto,
  SearchProfilesResponseDto,
} from './dto/profile-response.dto';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly selfProfileHandler: SelfProfileHandler,
    private readonly createProfileHandler: CreateProfileHandler,
    private readonly getProfileHandler: GetProfileHandler,
    private readonly meProfileHandler: MeProfileHandler,
    private readonly updateProfileHandler: UpdateProfileHandler,
    private readonly updateSkillsInterestsHandler: UpdateSkillsInterestsHandler,
    private readonly batchUpdateAchievementsHandler: BatchUpdateAchievementsHandler,
    private readonly searchProfilesHandler: SearchProfilesHandler,
  ) {}

  @AllowWaitlistNotActive()
  @Get('/self')
  async self(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const profile = await this.selfProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: profile };
  }

  @AllowWaitlistNotActive()
  @Get('/me')
  async me(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const profile = await this.meProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: profile };
  }

  @AllowOnboardingNotComplete()
  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CreateProfileBodyDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.createProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      ...body,
    });
    return { success: true };
  }

  @Get('/:profileId')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: GetProfileParamDto,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const profile = await this.getProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId: param.profileId,
    });
    return { success: true, data: profile };
  }

  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Put()
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdateProfileDto,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const result = await this.updateProfileHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      ...body,
    });
    return { success: true, data: result };
  }

  @Put('/skills-interests')
  async updateSkillsInterests(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdateSkillsInterestsDto,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const result = await this.updateSkillsInterestsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      ...body,
    });
    return { success: true, data: result };
  }

  @Put('/achievements/batch')
  async batchUpdateAchievements(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: BatchUpdateAchievementsDto,
  ): Promise<ApiResponseDto<ProfileResponseDto>> {
    const result = await this.batchUpdateAchievementsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      ...body,
    });
    return { success: true, data: result };
  }

  @Get('/search')
  @UseGuards(SessionGuard)
  async searchProfiles(
    @Req() req: FastifyRequestUserId,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<SearchProfilesResponseDto>> {
    const result = await this.searchProfilesHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      query,
      limit: limit ? parseInt(limit) : 5,
    });
    return { success: true, data: result };
  }
}
