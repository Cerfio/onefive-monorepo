import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Put,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { GetPostBookmarkHandler } from './handlers/get-post-bookmark.handler';
import { CreatePostBookmarkHandler } from './handlers/create-post-bookmark.handler';
import { DeletePostBookmarkHandler } from './handlers/delete-post-bookmark.handler';
import { TogglePostBookmarkHandler } from './handlers/toggle-post-bookmark.handler';
import {
  GetPostBookmarkQueryDto,
  BookmarkedPostResponseDto,
} from './dto/get-post-bookmark.dto';
import { CreatePostBookmarkParamDto } from './dto/create-post-bookmark.dto';
import { DeletePostBookmarkParamDto } from './dto/delete-post-bookmark.dto';

@Controller('post-bookmark')
export class PostBookmarkController {
  constructor(
    private readonly getPostBookmarkHandler: GetPostBookmarkHandler,
    private readonly createPostBookmarkHandler: CreatePostBookmarkHandler,
    private readonly deletePostBookmarkHandler: DeletePostBookmarkHandler,
    private readonly togglePostBookmarkHandler: TogglePostBookmarkHandler,
  ) {}

  @Get()
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query() query: GetPostBookmarkQueryDto,
  ): Promise<{ success: true; data: BookmarkedPostResponseDto[] }> {
    const bookmarks = await this.getPostBookmarkHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      limit: query.limit,
      skip: query.skip,
    });
    return { success: true, data: bookmarks };
  }

  @Post(':postId')
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: CreatePostBookmarkParamDto,
  ): Promise<{ success: true; data: { bookmarked: boolean } }> {
    const result = await this.createPostBookmarkHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId: param.postId,
    });
    return { success: true, data: result };
  }

  @Delete(':postId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: DeletePostBookmarkParamDto,
  ): Promise<{ success: true; data: { bookmarked: boolean } }> {
    const result = await this.deletePostBookmarkHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId: param.postId,
    });
    return { success: true, data: result };
  }

  @Put('toggle/:postId')
  async toggle(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param() param: CreatePostBookmarkParamDto,
  ): Promise<{ success: true; data: { bookmarked: boolean } }> {
    const result = await this.togglePostBookmarkHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      postId: param.postId,
    });
    return { success: true, data: result };
  }
}
