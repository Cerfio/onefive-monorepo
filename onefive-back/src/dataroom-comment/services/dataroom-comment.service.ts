import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import {
  DataroomCommentCreateException,
  DataroomCommentListException,
  DataroomCommentNotFoundException,
  DataroomCommentForbiddenException,
} from '../exceptions/dataroom-comment.exception';

const AUTHOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: { select: { url: true } },
} as const;

@Injectable()
export class DataroomCommentService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async checkCanComment(
    profileId: string,
    dataroomId: string,
    fileId: string,
  ): Promise<void> {
    const member = await this.prisma.member.findFirst({
      where: { profileId, dataroomId },
      include: { group: true },
    });

    if (!member) {
      throw new DataroomCommentForbiddenException(
        'You are not a member of this dataroom',
      );
    }

    if (member.group.hasAllAccess) return;

    const file = await this.prisma.dataroomFile.findUnique({
      where: { id: fileId },
      select: { categoryId: true },
    });

    if (!file) {
      throw new DataroomCommentNotFoundException();
    }

    const permission = await this.prisma.permissionCategory.findUnique({
      where: {
        categoryId_groupId: {
          categoryId: file.categoryId,
          groupId: member.group.id,
        },
      },
    });

    if (!permission?.canComment) {
      throw new DataroomCommentForbiddenException(
        'You do not have permission to comment on this file',
      );
    }
  }

  async create({
    dataroomId,
    fileId,
    profileId,
    content,
    pageNumber,
    parentId,
  }: {
    dataroomId: string;
    fileId: string;
    profileId: string;
    content: string;
    pageNumber?: number;
    parentId?: string;
  }) {
    try {
      if (parentId) {
        const parent = await this.prisma.dataroomFileComment.findFirst({
          where: { id: parentId, fileId, isDeleted: false },
        });
        if (!parent) {
          throw new DataroomCommentNotFoundException();
        }
      }

      return await this.prisma.dataroomFileComment.create({
        data: {
          dataroomId,
          fileId,
          profileId,
          content,
          pageNumber: pageNumber ?? null,
          parentId: parentId ?? null,
        },
        include: { author: { select: AUTHOR_SELECT } },
      });
    } catch (error) {
      if (error instanceof DataroomCommentNotFoundException) throw error;
      DataroomCommentCreateException.throw(this.logger, { error });
    }
  }

  async list({ fileId }: { fileId: string }) {
    try {
      const comments = await this.prisma.dataroomFileComment.findMany({
        where: { fileId, isDeleted: false, parentId: null },
        include: {
          author: { select: AUTHOR_SELECT },
          replies: {
            where: { isDeleted: false },
            include: { author: { select: AUTHOR_SELECT } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return { comments, total: comments.length };
    } catch (error) {
      DataroomCommentListException.throw(this.logger, { error });
    }
  }

  async update({
    commentId,
    profileId,
    content,
  }: {
    commentId: string;
    profileId: string;
    content: string;
  }) {
    const comment = await this.prisma.dataroomFileComment.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new DataroomCommentNotFoundException();
    if (comment.profileId !== profileId) {
      throw new DataroomCommentForbiddenException(
        'You can only edit your own comments',
      );
    }

    return await this.prisma.dataroomFileComment.update({
      where: { id: commentId },
      data: { content },
      select: { id: true, content: true, updatedAt: true },
    });
  }

  async delete({
    commentId,
    profileId,
    dataroomId,
  }: {
    commentId: string;
    profileId: string;
    dataroomId: string;
  }) {
    const comment = await this.prisma.dataroomFileComment.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new DataroomCommentNotFoundException();

    const isAuthor = comment.profileId === profileId;
    if (!isAuthor) {
      const dataroom = await this.prisma.dataroom.findUnique({
        where: { id: dataroomId },
        select: { createdBy: true },
      });
      if (dataroom?.createdBy !== profileId) {
        throw new DataroomCommentForbiddenException(
          'You can only delete your own comments',
        );
      }
    }

    await this.prisma.dataroomFileComment.update({
      where: { id: commentId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
