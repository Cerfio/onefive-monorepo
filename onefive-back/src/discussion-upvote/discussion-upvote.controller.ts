import {
  Controller,
  HttpCode,
  Post,
  Delete,
  Param,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { CreateDiscussionUpvoteHandler } from './handlers/create-discussion-upvote.handler';
import { DeleteDiscussionUpvoteHandler } from './handlers/delete-discussion-upvote.handler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { DiscussionUpvoteParamDto } from './dto/discussion-upvote.dto';

@Controller('discussions')
export class DiscussionUpvoteController {
  constructor(
    private readonly createDiscussionUpvoteHandler: CreateDiscussionUpvoteHandler,
    private readonly deleteDiscussionUpvoteHandler: DeleteDiscussionUpvoteHandler,
  ) {}

  @Post(':discussionId/upvote')
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionUpvoteParamDto,
  ) {
    await this.createDiscussionUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
    });

    return {
      success: true,
    };
  }

  @Delete(':discussionId/upvote')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param(ValidationPipe) param: DiscussionUpvoteParamDto,
  ) {
    await this.deleteDiscussionUpvoteHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      discussionId: param.discussionId,
    });

    return {
      success: true,
    };
  }
}
