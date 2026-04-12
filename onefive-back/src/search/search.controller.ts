import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { SearchBarHandler } from './handlers/searchbar.handler';
import { SearchHandler } from './handlers/search.handler';
import { SearchBarQueryDto, SearchQueryDto } from './dto';
import {
  SearchBarResponseDto,
  SearchResponseDto,
} from './dto/search-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('search')
@UseGuards(SessionGuard)
export class SearchController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly searchBarHandler: SearchBarHandler,
    private readonly searchHandler: SearchHandler,
  ) {}

  /**
   * Quick search for navbar suggestions
   * Returns limited results for people and companies
   */
  @Get('searchbar')
  async searchBar(
    @Req() req: FastifyRequestUserId,
    @Query(new ValidationPipe({ transform: true })) query: SearchBarQueryDto,
  ): Promise<ApiResponseDto<SearchBarResponseDto>> {
    this.logger.info('SearchBar endpoint called', {
      transactionId: req.id,
      userId: req.userId,
      query: query.q,
      limit: query.limit,
    });

    const result = await this.searchBarHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      query: query.q,
      limit: query.limit,
    });

    return { success: true, data: result };
  }

  /**
   * Full search with all content types
   * Returns people, companies, posts, and discussions
   */
  @Get()
  async search(
    @Req() req: FastifyRequestUserId,
    @Query(new ValidationPipe({ transform: true })) query: SearchQueryDto,
  ): Promise<ApiResponseDto<SearchResponseDto>> {
    this.logger.info('Search endpoint called', {
      transactionId: req.id,
      userId: req.userId,
      query: query.q,
      limit: query.limit,
    });

    const result = await this.searchHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      query: query.q,
      limit: query.limit,
    });

    return { success: true, data: result };
  }
}
