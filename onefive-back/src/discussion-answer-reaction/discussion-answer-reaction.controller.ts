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
import { CreateDiscussionAnswerReactionHandler } from './handlers/create-discussion-answer-reaction.handler';
import { DeleteDiscussionAnswerReactionHandler } from './handlers/delete-discussion-answer-reaction.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  DiscussionAnswerReactionParamDto,
  CreateDiscussionAnswerReactionBodyDto,
} from './dto/discussion-answer-reaction.dto';

@Controller('discussions')
@Throttle({
  short: { limit: 3, ttl: 1000 },
  medium: { limit: 20, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
}) // 30 reactions/min
export class DiscussionAnswerReactionController {
  constructor(
    private readonly createDiscussionAnswerReactionHandler: CreateDiscussionAnswerReactionHandler,
    private readonly deleteDiscussionAnswerReactionHandler: DeleteDiscussionAnswerReactionHandler,
  ) {}

  @Post(':discussionId/answers/:answerId/reaction')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerReactionBodyDto,
  ) {
    await this.createDiscussionAnswerReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: param.answerId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }

  @Delete(':discussionId/answers/:answerId/reaction')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerReactionBodyDto,
  ) {
    await this.deleteDiscussionAnswerReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: param.answerId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }
}
