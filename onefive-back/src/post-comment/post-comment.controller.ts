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
import { CreatePostCommentHandler } from './handlers/create-post-comment.handler';
import { GetPostCommentHandler } from './handlers/get-post-comment.handler';
import { ListPostCommentsHandler } from './handlers/list-post-comments.handler';
import { UpdatePostCommentHandler } from './handlers/update-post-comment.handler';
import { DeletePostCommentHandler } from './handlers/delete-post-comment.handler';

// Services
import { ProfileService } from '../profile/profile.service';

// DTOs
import { PostCommentResponseDto } from './dto/post-comment-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { ListPostCommentsDto } from './dto/list-post-comments.dto';

@Controller('post-comments')
@UseGuards(SessionGuard)
export class PostCommentController {
  constructor(
    private readonly createPostCommentHandler: CreatePostCommentHandler,
    private readonly getPostCommentHandler: GetPostCommentHandler,
    private readonly listPostCommentsHandler: ListPostCommentsHandler,
    private readonly updatePostCommentHandler: UpdatePostCommentHandler,
    private readonly deletePostCommentHandler: DeletePostCommentHandler,
    private readonly profileService: ProfileService,
  ) {}

  @Post('posts/:postId')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 15, ttl: 10000 },
    long: { limit: 20, ttl: 60000 },
  }) // 20 comments/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Body(ValidationPipe) createPostCommentDto: CreatePostCommentDto,
  ): Promise<ApiResponseDto<PostCommentResponseDto>> {
    const comment = await this.createPostCommentHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId,
      createPostCommentDto,
    });

    return {
      success: true,
      data: comment,
    };
  }

  @Get('posts/:postId')
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('postId') postId: string,
    @Query(ValidationPipe) listPostCommentsDto: ListPostCommentsDto,
  ): Promise<ApiResponseDto<PostCommentResponseDto>> {
    // Récupérer le profil de l'utilisateur courant
    const profiles = await this.profileService.list({
      transactionId: req.id,
      where: { userId: req.userId },
      select: { id: true },
      take: 1,
    });
    const profileId = profiles[0]?.id;

    const comments = await this.listPostCommentsHandler.execute({
      transactionId: req.id,
      postId,
      listPostCommentsDto,
      profileId,
    });

    return {
      success: true,
      data: comments,
    };
  }

  @Get(':id')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') commentId: string,
  ): Promise<ApiResponseDto<PostCommentResponseDto>> {
    const comment = await this.getPostCommentHandler.execute({
      transactionId: req.id,
      commentId,
    });

    return {
      success: true,
      data: comment,
    };
  }

  @Put(':id')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') commentId: string,
    @Body(ValidationPipe) updatePostCommentDto: UpdatePostCommentDto,
  ) {
    const comment = await this.updatePostCommentHandler.execute({
      transactionId: req.id,
      commentId,
      userId: req.userId,
      updatePostCommentDto,
    });

    return {
      success: true,
      data: comment,
    };
  }

  @Delete(':id')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') commentId: string,
  ): Promise<ApiResponseDto<PostCommentResponseDto>> {
    const result = await this.deletePostCommentHandler.execute({
      transactionId: req.id,
      commentId,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }
}
