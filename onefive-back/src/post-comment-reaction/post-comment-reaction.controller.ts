import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { SessionGuard } from 'src/common/guards/session-guard/session.guard';
import { CreatePostCommentReactionHandler } from './handlers/create-post-comment-reaction.handler';
import { UpdatePostCommentReactionHandler } from './handlers/update-post-comment-reaction.handler';
import { DeletePostCommentReactionHandler } from './handlers/delete-post-comment-reaction.handler';
import { ListPostCommentReactionsHandler } from './handlers/list-post-comment-reactions.handler';
import { ReactionType } from '@prisma/client';

@UseGuards(SessionGuard)
@Controller('post-comment-reactions')
export class PostCommentReactionController {
  constructor(
    private readonly createHandler: CreatePostCommentReactionHandler,
    private readonly updateHandler: UpdatePostCommentReactionHandler,
    private readonly deleteHandler: DeletePostCommentReactionHandler,
    private readonly listHandler: ListPostCommentReactionsHandler,
  ) {}

  @Post('comments/:commentId')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('commentId') commentId: string,
    @Body('reaction', ValidationPipe) reaction: ReactionType,
  ) {
    await this.createHandler.execute({
      transactionId: req.id,
      commentId,
      userId: req.userId,
      reaction,
    });
    return { success: true };
  }

  @Put('comments/:commentId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('commentId') commentId: string,
    @Body('reaction', ValidationPipe) reaction: ReactionType,
  ) {
    await this.updateHandler.execute({
      transactionId: req.id,
      commentId,
      userId: req.userId,
      reaction,
    });
    return { success: true };
  }

  @Delete('comments/:commentId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('commentId') commentId: string,
  ) {
    await this.deleteHandler.execute({
      transactionId: req.id,
      commentId,
      userId: req.userId,
    });
    return { success: true };
  }

  @Get('comments/:commentId')
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('commentId') commentId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const data = await this.listHandler.execute({
      transactionId: req.id,
      commentId,
      skip,
      take,
    });
    return { success: true, data };
  }
}
