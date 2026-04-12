import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { PostReaction, Prisma } from '@prisma/client';
import {
  PostReactionCreateException,
  PostReactionGetException,
  PostReactionListException,
  PostReactionUpdateException,
  PostReactionDeleteException,
} from './post-reaction.exception';

@Injectable()
export class PostReactionService {
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
    data: Prisma.PostReactionCreateInput;
  }): Promise<PostReaction> {
    try {
      return await this.prisma.postReaction.create({
        data,
      });
    } catch (error) {
      PostReactionCreateException.throw(this.logger, {
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
    where: Prisma.PostReactionWhereUniqueInput;
    select?: Prisma.PostReactionSelect;
  }): Promise<PostReaction | null> {
    try {
      return await this.prisma.postReaction.findUnique({
        where,
        select,
      });
    } catch (error) {
      PostReactionGetException.throw(this.logger, {
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
    where?: Prisma.PostReactionWhereInput;
    select?: Prisma.PostReactionSelect;
    orderBy?: Prisma.PostReactionOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<PostReaction[]> {
    try {
      return await this.prisma.postReaction.findMany({
        where,
        select,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      PostReactionListException.throw(this.logger, {
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
    where: Prisma.PostReactionWhereUniqueInput;
    data: Prisma.PostReactionUpdateInput;
  }): Promise<PostReaction> {
    try {
      return await this.prisma.postReaction.update({
        where,
        data,
      });
    } catch (error) {
      PostReactionUpdateException.throw(this.logger, {
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
    where: Prisma.PostReactionWhereUniqueInput;
  }): Promise<PostReaction> {
    try {
      return await this.prisma.postReaction.delete({
        where,
      });
    } catch (error) {
      PostReactionDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
