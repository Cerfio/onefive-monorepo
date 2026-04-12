import {
  Body,
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
import { ListProfileSuggestionsHandler } from './handlers/list-profile-suggestions.handler';
import { ListStartupSuggestionsHandler } from './handlers/list-startup-suggestions.handler';
import { GetProfileStatisticsHandler } from './handlers/get-profile-statistics.handler';
import { ListBookmarksHandler } from './handlers/list-bookmarks.handler';
import { ToggleBookmarkHandler } from './handlers/toggle-bookmark.handler';
import {
  GetProfileSuggestionsQueryDto,
  ProfileSuggestionResponseDto,
} from './dto/get-profile-suggestions.dto';
import {
  GetStartupSuggestionsQueryDto,
  StartupSuggestionResponseDto,
} from './dto/get-startup-suggestions.dto';
import { ProfileStatisticsResponseDto } from './dto/get-profile-statistics.dto';
import {
  GetBookmarksQueryDto,
  BookmarkPostParamDto,
  BookmarkedPostResponseDto,
} from './dto/bookmarks.dto';

@Controller('feed-extra')
export class FeedExtraController {
  constructor(
    private readonly listProfileSuggestionsHandler: ListProfileSuggestionsHandler,
    private readonly listStartupSuggestionsHandler: ListStartupSuggestionsHandler,
    private readonly getProfileStatisticsHandler: GetProfileStatisticsHandler,
    private readonly listBookmarksHandler: ListBookmarksHandler,
    private readonly toggleBookmarkHandler: ToggleBookmarkHandler,
  ) {}

  @Get('/profile-suggestions')
  async listProfileSuggestions(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetProfileSuggestionsQueryDto,
  ): Promise<{ success: true; data: ProfileSuggestionResponseDto[] }> {
    const suggestions = await this.listProfileSuggestionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: suggestions };
  }

  @Get('/startup-suggestions')
  async listStartupSuggestions(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetStartupSuggestionsQueryDto,
  ): Promise<{ success: true; data: StartupSuggestionResponseDto[] }> {
    const suggestions = await this.listStartupSuggestionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: suggestions };
  }

  @Get('/profile-statistics')
  async getProfileStatistics(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<{ success: true; data: ProfileStatisticsResponseDto }> {
    const statistics = await this.getProfileStatisticsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: statistics };
  }

  @Get('/bookmarks')
  async listBookmarks(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetBookmarksQueryDto,
  ): Promise<{ success: true; data: BookmarkedPostResponseDto[] }> {
    const bookmarks = await this.listBookmarksHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: bookmarks };
  }

  @Post('/bookmark/:postId')
  @HttpCode(200)
  async toggleBookmark(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: BookmarkPostParamDto,
  ): Promise<{ success: true; data: { bookmarked: boolean } }> {
    const result = await this.toggleBookmarkHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId: param.postId,
    });
    return { success: true, data: result };
  }
}
