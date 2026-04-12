import {
  Controller,
  HttpCode,
  Post,
  Delete,
  Body,
  Param,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateDiscussionAnswerReplyReactionHandler } from './handlers/create-discussion-answer-reply-reaction.handler';
import { DeleteDiscussionAnswerReplyReactionHandler } from './handlers/delete-discussion-answer-reply-reaction.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  DiscussionAnswerReplyReactionParamDto,
  CreateDiscussionAnswerReplyReactionBodyDto,
} from './dto/discussion-answer-reply-reaction.dto';

@Controller('discussions')
@Throttle({
  short: { limit: 3, ttl: 1000 },
  medium: { limit: 20, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
}) // 30 reactions/min
export class DiscussionAnswerReplyReactionController {
  constructor(
    private readonly createDiscussionAnswerReplyReactionHandler: CreateDiscussionAnswerReplyReactionHandler,
    private readonly deleteDiscussionAnswerReplyReactionHandler: DeleteDiscussionAnswerReplyReactionHandler,
  ) {}

  @Post(':discussionId/answers/:answerId/replies/:replyId/reaction')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReplyReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerReplyReactionBodyDto,
  ) {
    await this.createDiscussionAnswerReplyReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }

  @Delete(':discussionId/answers/:answerId/replies/:replyId/reaction')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReplyReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerReplyReactionBodyDto,
  ) {
    await this.deleteDiscussionAnswerReplyReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }
}
