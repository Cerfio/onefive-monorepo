import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { AllowOnboardingNotComplete } from 'src/common/decorators/allow-onboarding-not-complete.decorator';
import { GetProfileSuggestionHandler } from './handlers/get-profile-suggestion.handler';
import { ToggleProfileFollowHandler } from './handlers/toggle-profile-follow.handler';
import {
  GetProfileSuggestionQueryDto,
  ProfileSuggestionResponseDto,
} from './dto/get-profile-suggestion.dto';
import { ToggleProfileFollowParamDto } from './dto/toggle-profile-follow.dto';

@Controller('profile-suggestion')
export class ProfileSuggestionController {
  constructor(
    private readonly getProfileSuggestionHandler: GetProfileSuggestionHandler,
    private readonly toggleProfileFollowHandler: ToggleProfileFollowHandler,
  ) {}

  @AllowOnboardingNotComplete()
  @Get()
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetProfileSuggestionQueryDto,
  ): Promise<{ success: true; data: ProfileSuggestionResponseDto[] }> {
    const suggestions = await this.getProfileSuggestionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: suggestions };
  }

  @AllowOnboardingNotComplete()
  @Post('follow/:profileId')
  @HttpCode(200)
  async toggleFollow(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: ToggleProfileFollowParamDto,
  ): Promise<{ success: true; data: { following: boolean } }> {
    const result = await this.toggleProfileFollowHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId: param.profileId,
    });
    return { success: true, data: result };
  }
}
