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
import { CreateDiscussionAnswerReplyUpvoteHandler } from './handlers/create-discussion-answer-reply-upvote.handler';
import { DeleteDiscussionAnswerReplyUpvoteHandler } from './handlers/delete-discussion-answer-reply-upvote.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { DiscussionAnswerReplyUpvoteParamDto } from './dto/discussion-answer-reply-upvote.dto';

@Controller('discussions/:discussionId/answers/:answerId/replies')
@Throttle({
  short: { limit: 3, ttl: 1000 },
  medium: { limit: 20, ttl: 10000 },
  long: { limit: 30, ttl: 60000 },
}) // 30 upvotes/min
export class DiscussionAnswerReplyUpvoteController {
  constructor(
    private readonly createDiscussionAnswerReplyUpvoteHandler: CreateDiscussionAnswerReplyUpvoteHandler,
    private readonly deleteDiscussionAnswerReplyUpvoteHandler: DeleteDiscussionAnswerReplyUpvoteHandler,
  ) {}

  @Post(':replyId/upvote')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReplyUpvoteParamDto,
  ) {
    await this.createDiscussionAnswerReplyUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
    });

    return {
      success: true,
    };
  }

  @Delete(':replyId/upvote')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReplyUpvoteParamDto,
  ) {
    await this.deleteDiscussionAnswerReplyUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
    });

    return {
      success: true,
    };
  }
}
