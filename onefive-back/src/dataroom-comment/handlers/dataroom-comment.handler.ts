import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { DataroomCommentService } from '../services/dataroom-comment.service';
import { CreateDataroomCommentDto, CreateDataroomCommentResponseDto } from '../dto/create-dataroom-comment.dto';
import { UpdateDataroomCommentDto, UpdateDataroomCommentResponseDto } from '../dto/update-dataroom-comment.dto';
import { ListDataroomCommentsResponseDto } from '../dto/list-dataroom-comments.dto';

@Injectable()
export class DataroomCommentHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly commentService: DataroomCommentService,
  ) {}

  async create(
    dataroomId: string,
    fileId: string,
    profileId: string,
    dto: CreateDataroomCommentDto,
  ): Promise<CreateDataroomCommentResponseDto> {
    await this.commentService.checkCanComment(profileId, dataroomId, fileId);

    const comment = await this.commentService.create({
      dataroomId,
      fileId,
      profileId,
      content: dto.content,
      pageNumber: dto.pageNumber,
      parentId: dto.parentId,
    });

    return {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        pageNumber: comment.pageNumber,
        parentId: comment.parentId,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author as any,
      },
    };
  }

  async list(
    dataroomId: string,
    fileId: string,
  ): Promise<ListDataroomCommentsResponseDto> {
    const result = await this.commentService.list({ fileId });

    return {
      success: true,
      data: {
        comments: result.comments.map((c: any) => ({
          id: c.id,
          content: c.content,
          pageNumber: c.pageNumber,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          author: c.author,
          replies: c.replies.map((r: any) => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            author: r.author,
          })),
        })),
        total: result.total,
      },
    };
  }

  async update(
    commentId: string,
    profileId: string,
    dto: UpdateDataroomCommentDto,
  ): Promise<UpdateDataroomCommentResponseDto> {
    const comment = await this.commentService.update({
      commentId,
      profileId,
      content: dto.content,
    });

    return {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        updatedAt: comment.updatedAt.toISOString(),
      },
    };
  }

  async delete(
    commentId: string,
    profileId: string,
    dataroomId: string,
  ): Promise<{ success: boolean }> {
    await this.commentService.delete({ commentId, profileId, dataroomId });
    return { success: true };
  }
}
