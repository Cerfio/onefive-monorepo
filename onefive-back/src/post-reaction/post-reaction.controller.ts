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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';

// Handlers
import { CreatePostReactionHandler } from './handlers/create-post-reaction.handler';
import { GetPostReactionHandler } from './handlers/get-post-reaction.handler';
import { ListPostReactionsHandler } from './handlers/list-post-reactions.handler';
import { UpdatePostReactionHandler } from './handlers/update-post-reaction.handler';
import { DeletePostReactionHandler } from './handlers/delete-post-reaction.handler';

// DTOs
import { PostReactionResponseDto } from './dto/post-reaction-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { UpdatePostReactionDto } from './dto/update-post-reaction.dto';
import { ListPostReactionsDto } from './dto/list-post-reactions.dto';

@Controller('post-reactions')
@UseGuards(SessionGuard)
export class PostReactionController {
  constructor(
    private readonly createPostReactionHandler: CreatePostReactionHandler,
    private readonly getPostReactionHandler: GetPostReactionHandler,
    private readonly listPostReactionsHandler: ListPostReactionsHandler,
    private readonly updatePostReactionHandler: UpdatePostReactionHandler,
    private readonly deletePostReactionHandler: DeletePostReactionHandler,
  ) {}

  @Post('posts/:postId')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 20, ttl: 10000 },
    long: { limit: 30, ttl: 60000 },
  }) // 30 reactions/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Body(ValidationPipe) createPostReactionDto: CreatePostReactionDto,
  ): Promise<ApiResponseDto<PostReactionResponseDto>> {
    const reaction = await this.createPostReactionHandler.execute({
      transactionId: req.id,
      postId,
      userId: req.userId,
      createPostReactionDto,
    });

    return {
      success: true,
      data: reaction,
    };
  }

  @Get('posts/:postId')
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Query(ValidationPipe) listPostReactionsDto: ListPostReactionsDto,
  ): Promise<ApiResponseDto<PostReactionResponseDto>> {
    const reactions = await this.listPostReactionsHandler.execute({
      transactionId: req.id,
      postId,
      listPostReactionsDto,
      currentProfileId: req.userId,
    });

    return {
      success: true,
      data: reactions,
    };
  }

  @Get('posts/:postId/users/:userId')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponseDto<PostReactionResponseDto>> {
    const reaction = await this.getPostReactionHandler.execute({
      transactionId: req.id,
      postId,
      userId,
    });

    return {
      success: true,
      data: reaction,
    };
  }

  @Put('posts/:postId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Body(ValidationPipe) updatePostReactionDto: UpdatePostReactionDto,
  ): Promise<ApiResponseDto<PostReactionResponseDto>> {
    const reaction = await this.updatePostReactionHandler.execute({
      transactionId: req.id,
      postId,
      userId: req.userId,
      updatePostReactionDto,
    });

    return {
      success: true,
      data: reaction,
    };
  }

  @Delete('posts/:postId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
  ): Promise<ApiResponseDto<PostReactionResponseDto>> {
    const result = await this.deletePostReactionHandler.execute({
      transactionId: req.id,
      postId,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }
}
