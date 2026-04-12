import { Inject, Injectable } from '@nestjs/common';
import {
  Prisma,
  Discussion,
  DiscussionReaction,
  DiscussionUpvote,
  DiscussionAnswer,
  DiscussionAnswerUpvote,
  DiscussionAnswerReply,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import {
  DiscussionCreateException,
  DiscussionDeleteException,
  DiscussionGetException,
  DiscussionListException,
  DiscussionUpdateException,
} from './discussion.exception';

type DiscussionAnswerReplyInclude = DiscussionAnswerReply & {
  upvotes: DiscussionAnswerUpvote[];
  reactions: DiscussionReaction[];
};

type DiscussionAnswerInclude = DiscussionAnswer & {
  upvotes: DiscussionAnswerUpvote[];
  reactions: DiscussionReaction[];
  replies: DiscussionAnswerReplyInclude[];
};

@Injectable()
export class DiscussionService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.DiscussionCreateInput;
  }): Promise<Discussion> {
    try {
      return this.prisma.discussion.create({
        data,
      });
    } catch (error) {
      DiscussionCreateException.throw(this.logger, {
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
    where: Prisma.DiscussionWhereUniqueInput;
    data: Prisma.DiscussionUpdateInput;
  }): Promise<Discussion> {
    try {
      return this.prisma.discussion.update({
        where,
        data,
      });
    } catch (error) {
      DiscussionUpdateException.throw(this.logger, {
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
    where: Prisma.DiscussionWhereUniqueInput;
    select?: Prisma.DiscussionSelect;
  }) {
    try {
      return (await this.prisma.discussion.findUnique({
        where,
        select,
      })) as unknown as Promise<
        Discussion & {
          reactions: DiscussionReaction[];
          upvotes: DiscussionUpvote[];
          answers: DiscussionAnswerInclude[];
          _count: {
            answers: number;
            upvotes: number;
            views: number;
          };
        }
      >;
    } catch (error) {
      DiscussionGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async list({
    transactionId,
    where,
    orderBy,
    skip,
    take,
    select,
  }: {
    transactionId: string;
    where?: Prisma.DiscussionWhereInput;
    orderBy?: any; //Prisma.DiscussionOrderByWithRelationAndSearchRelevanceInput[];
    skip?: number;
    take?: number;
    select?: Prisma.DiscussionSelect;
  }) {
    try {
      return await this.prisma.discussion.findMany({
        where,
        orderBy,
        skip,
        take,
        select,
      });
    } catch (error) {
      DiscussionListException.throw(this.logger, {
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
    where: Prisma.DiscussionWhereUniqueInput;
  }): Promise<Discussion> {
    try {
      return await this.prisma.discussion.delete({
        where,
      });
    } catch (error) {
      DiscussionDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
