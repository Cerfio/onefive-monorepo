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
import { CreateDiscussionAnswerHandler } from './handlers/create-discussion-answer.handler';
import { UpdateDiscussionAnswerHandler } from './handlers/update-discussion-answer.handler';
import { DeleteDiscussionAnswerHandler } from './handlers/delete-discussion-answer.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  CreateDiscussionAnswerResponseDto,
  UpdateDiscussionAnswerResponseDto,
} from './dto/discussion-answer-response.dto';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import {
  DiscussionAnswerParamDto,
  AnswerParamDto,
  CreateDiscussionAnswerBodyDto,
  UpdateDiscussionAnswerBodyDto,
} from './dto/discussion-answer.dto';

@Controller('discussions/:discussionId/answers')
export class DiscussionAnswerController {
  constructor(
    private readonly createDiscussionAnswerHandler: CreateDiscussionAnswerHandler,
    private readonly updateDiscussionAnswerHandler: UpdateDiscussionAnswerHandler,
    private readonly deleteDiscussionAnswerHandler: DeleteDiscussionAnswerHandler,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 15, ttl: 10000 },
    long: { limit: 15, ttl: 60000 },
  }) // 15 answers/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionAnswerParamDto,
    @Body(ValidationPipe) body: CreateDiscussionAnswerBodyDto,
  ): Promise<ApiResponseDto<CreateDiscussionAnswerResponseDto>> {
    const answer = await this.createDiscussionAnswerHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
      content: body.content,
    });

    return {
      success: true,
      data: {
        id: answer.id,
      },
    };
  }

  @Put(':answerId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) answerParam: AnswerParamDto,
    @Body(ValidationPipe) body: UpdateDiscussionAnswerBodyDto,
  ): Promise<ApiResponseDto<UpdateDiscussionAnswerResponseDto>> {
    const answer = await this.updateDiscussionAnswerHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: answerParam.answerId,
      content: body.content,
    });

    return {
      success: true,
      data: answer,
    };
  }

  @Delete(':answerId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) answerParam: AnswerParamDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.deleteDiscussionAnswerHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      answerId: answerParam.answerId,
    });

    return {
      success: true,
    };
  }
}
