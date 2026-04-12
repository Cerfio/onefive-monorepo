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
import { CreateDiscussionReactionHandler } from './handlers/create-discussion-reaction.handler';
import { DeleteDiscussionReactionHandler } from './handlers/delete-discussion-reaction.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import {
  DiscussionReactionParamDto,
  CreateDiscussionReactionBodyDto,
} from './dto/discussion-reaction.dto';

@Controller('discussions')
export class DiscussionReactionController {
  constructor(
    private readonly createDiscussionReactionHandler: CreateDiscussionReactionHandler,
    private readonly deleteDiscussionReactionHandler: DeleteDiscussionReactionHandler,
  ) {}

  @Post(':discussionId/reaction')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionReactionBodyDto,
  ) {
    await this.createDiscussionReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }

  @Delete(':discussionId/reaction')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionReactionParamDto,
    @Body(ValidationPipe) body: CreateDiscussionReactionBodyDto,
  ) {
    await this.deleteDiscussionReactionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
      reaction: body.reaction,
    });

    return {
      success: true,
    };
  }
}
