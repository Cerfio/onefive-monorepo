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
  Inject,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';

// Handlers
import { CreatePostHandler } from './handlers/create-post.handler';
import { ListPostsHandler } from './handlers/list-posts.handler';
import { UpdatePostHandler } from './handlers/update-post.handler';
import { DeletePostHandler } from './handlers/delete-post.handler';
import { CreateRepostHandler } from './handlers/create-repost.handler';
import { PostService } from './post.service';

// Services
import { LogService } from 'logstash-winston-3';

// DTOs
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { CreateRepostDto } from './dto/create-repost.dto';
import {
  CreatePostResponseDto,
  ListPostsResponseDto,
  FeedPostsResponseDto,
  GetPostResponseDto,
  UpdatePostResponseDto,
  DeletePostResponseDto,
  CreateRepostResponseDto,
} from './dto/post-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('posts')
@UseGuards(SessionGuard)
export class PostController {
  constructor(
    private readonly createPostHandler: CreatePostHandler,
    private readonly listPostsHandler: ListPostsHandler,
    private readonly updatePostHandler: UpdatePostHandler,
    private readonly deletePostHandler: DeletePostHandler,
    private readonly createRepostHandler: CreateRepostHandler,
    private readonly postService: PostService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 10000 },
    long: { limit: 10, ttl: 60000 },
  }) // 10 posts/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<CreatePostResponseDto>> {
    const post = await this.createPostHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      req,
    });

    return {
      success: true,
      data: post,
    };
  }

  @Get()
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query(ValidationPipe) listPostsDto: ListPostsDto,
  ): Promise<ApiResponseDto<ListPostsResponseDto>> {
    const posts = await this.listPostsHandler.execute({
      transactionId: req.id,
      listPostsDto,
      profileId: req.userId,
    });

    return {
      success: true,
      data: posts,
    };
  }

  @Get('feed')
  async feed(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query(new ValidationPipe({ transform: true })) query: FeedQueryDto,
  ): Promise<ApiResponseDto<FeedPostsResponseDto>> {
    const tagsArray = query.tags
      ? query.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const posts = await this.postService.listWithEnrichment({
      transactionId: req.id,
      authId: req.userId,
      skip: query.skip ?? 0,
      limit: query.limit ?? 10,
      tags: tagsArray,
    });

    return {
      success: true,
      data: posts,
    };
  }

  @Get(':id')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') postId: string,
  ): Promise<ApiResponseDto<GetPostResponseDto>> {
    const post = await this.postService.getWithEnrichment({
      transactionId: req.id,
      postId,
      authId: req.userId,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      success: true,
      data: post,
    };
  }

  @Put(':id')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') postId: string,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
  ): Promise<ApiResponseDto<UpdatePostResponseDto>> {
    const post = await this.updatePostHandler.execute({
      transactionId: req.id,
      postId,
      userId: req.userId,
      updatePostDto,
    });

    return {
      success: true,
      data: post,
    };
  }

  @Delete(':id')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') postId: string,
  ): Promise<ApiResponseDto<DeletePostResponseDto>> {
    const result = await this.deletePostHandler.execute({
      transactionId: req.id,
      postId,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/repost')
  @HttpCode(200)
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 10000 },
    long: { limit: 10, ttl: 60000 },
  }) // 10 reposts/min anti-spam
  async repost(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') postId: string,
    @Body(ValidationPipe) createRepostDto: CreateRepostDto,
  ): Promise<ApiResponseDto<CreateRepostResponseDto>> {
    const repost = await this.createRepostHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId,
      createRepostDto,
    });

    return {
      success: true,
      data: repost,
    };
  }
}
