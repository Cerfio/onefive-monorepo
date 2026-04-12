import {
  Controller,
  HttpCode,
  Post,
  Delete,
  Param,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateDiscussionAnswerUpvoteHandler } from './handlers/create-discussion-answer-upvote.handler';
import { DeleteDiscussionAnswerUpvoteHandler } from './handlers/delete-discussion-answer-upvote.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { DiscussionAnswerUpvoteParamDto } from './dto/discussion-answer-upvote.dto';

@Controller('discussions/:discussionId/answers')
@Throttle({
  short: { limit: 3, ttl: 1000 },
  medium: { limit: 20, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
}) // 30 upvotes/min
export class DiscussionAnswerUpvoteController {
  constructor(
    private readonly createDiscussionAnswerUpvoteHandler: CreateDiscussionAnswerUpvoteHandler,
    private readonly deleteDiscussionAnswerUpvoteHandler: DeleteDiscussionAnswerUpvoteHandler,
  ) {}

  @Post(':answerId/upvote')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerUpvoteParamDto,
  ) {
    await this.createDiscussionAnswerUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: param.answerId,
    });

    return {
      success: true,
    };
  }

  @Delete(':answerId/upvote')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerUpvoteParamDto,
  ) {
    await this.deleteDiscussionAnswerUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: param.answerId,
    });

    return {
      success: true,
    };
  }
}
