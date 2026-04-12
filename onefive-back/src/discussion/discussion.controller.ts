import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateDiscussionHandler } from './handlers/create-discussion.handler';
import { ListDiscussionHandler } from './handlers/list-discussion.handler';
import { GetDiscussionHandler } from './handlers/get-discussion.handler';
import { UpdateDiscussionHandler } from './handlers/update-discussion.handler';
import { DeleteDiscussionHandler } from './handlers/delete-discussion.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { CreateDiscussionBodyDto } from './dto/create-discussion.dto';
import { ListDiscussionsDto } from './dto/list-discussions.dto';
import { GetDiscussionParamDto } from './dto/get-discussion.dto';
import {
  UpdateDiscussionBodyDto,
  UpdateDiscussionParamDto,
} from './dto/update-discussion.dto';
import { DeleteDiscussionParamDto } from './dto/delete-discussion.dto';
import {
  CreateDiscussionResponseDto,
  ListDiscussionsResponseDto,
  GetDiscussionResponseDto,
  UpdateDiscussionResponseDto,
} from './dto/discussion-response.dto';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('discussion')
@ApiTags('discussion')
export class DiscussionController {
  constructor(
    private readonly createDiscussionHandler: CreateDiscussionHandler,
    private readonly listDiscussionHandler: ListDiscussionHandler,
    private readonly getDiscussionHandler: GetDiscussionHandler,
    private readonly updateDiscussionHandler: UpdateDiscussionHandler,
    private readonly deleteDiscussionHandler: DeleteDiscussionHandler,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 10000 },
    long: { limit: 10, ttl: 60000 },
  }) // 10 discussions/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body(ValidationPipe) body: CreateDiscussionBodyDto,
  ): Promise<ApiResponseDto<CreateDiscussionResponseDto>> {
    const discussion = await this.createDiscussionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      content: body.content,
      context: body.context,
      question: body.question,
      type: body.type,
      options: body.options || [],
      tags: body.tags,
    });

    return {
      success: true,
      data: {
        id: discussion.id,
      },
    };
  }

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['NEWEST', 'MOST_UPVOTED', 'MOST_ANSWERED', 'MOST_VIEWED'],
  })
  @ApiQuery({ name: 'profileId', required: false, type: String })
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query(ValidationPipe) query: ListDiscussionsDto,
  ): Promise<ApiResponseDto<ListDiscussionsResponseDto>> {
    const discussions = await this.listDiscussionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit || 20,
      offset: query.offset || 0,
      tag: query.tag,
      search: query.search,
      sort: query.sort,
      profileId: query.profileId,
    });

    return {
      success: true,
      data: PaginatedResponseDto.fromOffset({
        items: discussions,
        skip: query.offset || 0,
        limit: query.limit || 20,
      }),
    };
  }

  @Get(':discussionId')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: GetDiscussionParamDto,
  ): Promise<ApiResponseDto<GetDiscussionResponseDto>> {
    const discussion = await this.getDiscussionHandler.execute({
      transactionId: req.id,
      discussionId: param.discussionId,
      userId: req.userId,
    });

    return {
      success: true,
      data: discussion,
    };
  }

  @Put(':discussionId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: UpdateDiscussionParamDto,
    @Body(ValidationPipe) body: UpdateDiscussionBodyDto,
  ): Promise<ApiResponseDto<UpdateDiscussionResponseDto>> {
    const discussion = await this.updateDiscussionHandler.execute({
      transactionId: req.id,
      discussionId: param.discussionId,
      userId: req.userId,
      question: body.question,
      context: body.context,
      content: body.content,
      options: body.options,
      tags: body.tags,
    });

    return {
      success: true,
      data: discussion,
    };
  }

  @Delete(':discussionId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DeleteDiscussionParamDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.deleteDiscussionHandler.execute({
      transactionId: req.id,
      discussionId: param.discussionId,
      userId: req.userId,
    });

    return {
      success: true,
    };
  }
}
