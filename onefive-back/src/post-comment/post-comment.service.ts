import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { PostComment, Prisma } from '@prisma/client';
import {
  PostCommentCreateException,
  PostCommentGetException,
  PostCommentListException,
  PostCommentUpdateException,
  PostCommentDeleteException,
} from './post-comment.exception';

@Injectable()
export class PostCommentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.PostCommentCreateInput;
  }): Promise<PostComment> {
    try {
      return await this.prisma.postComment.create({
        data,
      });
    } catch (error) {
      PostCommentCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
    select,
  }: {
    transactionId: string;
    where: Prisma.PostCommentWhereUniqueInput;
    select?: Prisma.PostCommentSelect;
  }): Promise<PostComment | null> {
    try {
      return await this.prisma.postComment.findUnique({
        where,
        select,
      });
    } catch (error) {
      PostCommentGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async list({
    transactionId,
    where,
    select,
    orderBy,
    skip,
    take,
  }: {
    transactionId: string;
    where?: Prisma.PostCommentWhereInput;
    select?: Prisma.PostCommentSelect;
    orderBy?: Prisma.PostCommentOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<PostComment[]> {
    try {
      return await this.prisma.postComment.findMany({
        where,
        select,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      PostCommentListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
  }: {
    transactionId: string;
    where: Prisma.PostCommentWhereUniqueInput;
    data: Prisma.PostCommentUpdateInput;
  }): Promise<PostComment> {
    try {
      return await this.prisma.postComment.update({
        where,
        data,
      });
    } catch (error) {
      PostCommentUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.PostCommentWhereUniqueInput;
  }): Promise<PostComment> {
    try {
      return await this.prisma.postComment.delete({
        where,
      });
    } catch (error) {
      PostCommentDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
