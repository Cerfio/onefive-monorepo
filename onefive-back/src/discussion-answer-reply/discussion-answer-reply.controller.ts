import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateDiscussionAnswerReplyHandler } from './handlers/create-discussion-answer-reply.handler';
import { UpdateDiscussionAnswerReplyHandler } from './handlers/update-discussion-answer-reply.handler';
import { DeleteDiscussionAnswerReplyHandler } from './handlers/delete-discussion-answer-reply.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  CreateDiscussionAnswerReplyResponseDto,
  UpdateDiscussionAnswerReplyResponseDto,
} from './dto/discussion-answer-reply-response.dto';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import {
  DiscussionAnswerReplyParamDto,
  ReplyParamDto,
  CreateDiscussionAnswerReplyBodyDto,
  UpdateDiscussionAnswerReplyBodyDto,
} from './dto/discussion-answer-reply.dto';

@Controller('discussions/:discussionId/answers/:answerId/replies')
export class DiscussionAnswerReplyController {
  constructor(
    private readonly createDiscussionAnswerReplyHandler: CreateDiscussionAnswerReplyHandler,
    private readonly updateDiscussionAnswerReplyHandler: UpdateDiscussionAnswerReplyHandler,
    private readonly deleteDiscussionAnswerReplyHandler: DeleteDiscussionAnswerReplyHandler,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 15, ttl: 10000 },
    long: { limit: 15, ttl: 60000 },
  }) // 15 replies/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerReplyParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerReplyBodyDto,
  ): Promise<ApiResponseDto<CreateDiscussionAnswerReplyResponseDto>> {
    const reply = await this.createDiscussionAnswerReplyHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: param.answerId,
      content: body.content,
    });

    return {
      success: true,
      data: {
        id: reply.id,
      },
    };
  }

  @Put(':replyId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: ReplyParamDto,
    @Body(ValidationPipe) body: UpdateDiscussionAnswerReplyBodyDto,
  ): Promise<ApiResponseDto<UpdateDiscussionAnswerReplyResponseDto>> {
    const reply = await this.updateDiscussionAnswerReplyHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
      content: body.content,
    });

    return {
      success: true,
      data: reply,
    };
  }

  @Delete(':replyId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: ReplyParamDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.deleteDiscussionAnswerReplyHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      replyId: param.replyId,
    });

    return {
      success: true,
    };
  }
}
