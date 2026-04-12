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
import { GetStartupSuggestionHandler } from './handlers/get-startup-suggestion.handler';
import { FollowsService } from '../follows/follows.service';
import {
  GetStartupSuggestionQueryDto,
  StartupSuggestionResponseDto,
} from './dto/get-startup-suggestion.dto';
import { ToggleStartupFollowParamDto } from './dto/toggle-startup-follow.dto';

@Controller('startup-suggestion')
export class StartupSuggestionController {
  constructor(
    private readonly getStartupSuggestionHandler: GetStartupSuggestionHandler,
    private readonly followsService: FollowsService,
  ) {}

  @Get()
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetStartupSuggestionQueryDto,
  ): Promise<{ success: true; data: StartupSuggestionResponseDto[] }> {
    const suggestions = await this.getStartupSuggestionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: suggestions };
  }

  @Post('follow/:startupId')
  @HttpCode(200)
  async toggleFollow(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: ToggleStartupFollowParamDto,
  ): Promise<{ success: true; data: { following: boolean } }> {
    const result = await this.followsService.toggleStartupFollow({
      transactionId: req.id,
      userId: req.userId,
      startupId: param.startupId,
    });
    return { success: true, data: result };
  }
}
