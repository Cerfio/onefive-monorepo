import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { ListProfilePostsHandler } from './handlers/list-profile-posts.handler';
import { ListProfilePostsDto } from './dto/list-profile-posts.dto';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';

@UseGuards(SessionGuard)
@Controller('profile-post')
export class ProfilePostController {
  constructor(
    private readonly listProfilePostsHandler: ListProfilePostsHandler,
  ) {}

  @Get(':profileId')
  async list(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
    @Query(ValidationPipe) query: ListProfilePostsDto,
  ) {
    const result = await this.listProfilePostsHandler.execute({
      transactionId: req.id,
      authProfileId: req.userId,
      profileId,
      query,
    });
    return { success: true, data: result };
  }
}
