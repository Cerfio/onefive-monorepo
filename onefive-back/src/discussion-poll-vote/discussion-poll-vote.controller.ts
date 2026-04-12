import {
  Controller,
  HttpCode,
  Post,
  Body,
  Param,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { CreateDiscussionPollVoteHandler } from './handlers/create-discussion-poll-vote.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  DiscussionPollVoteParamDto,
  CreateDiscussionPollVoteBodyDto,
} from './dto/discussion-poll-vote.dto';

@Controller('discussions')
export class DiscussionPollVoteController {
  constructor(
    private readonly createDiscussionPollVoteHandler: CreateDiscussionPollVoteHandler,
  ) {}

  @Post(':discussionId/poll-vote')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionPollVoteParamDto,
    @Body(ValidationPipe) body: CreateDiscussionPollVoteBodyDto,
  ) {
    await this.createDiscussionPollVoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
      options: body.options,
    });

    return {
      success: true,
    };
  }
}
