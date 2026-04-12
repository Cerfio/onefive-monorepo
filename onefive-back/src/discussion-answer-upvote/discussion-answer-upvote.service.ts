import { Inject, Injectable } from '@nestjs/common';
import { Prisma, DiscussionAnswerUpvote } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import {
  DiscussionAnswerUpvoteCreateException,
  DiscussionAnswerUpvoteCreateAlreadyExistsException,
  DiscussionAnswerUpvoteDeleteException,
  DiscussionAnswerUpvoteNotFoundException,
} from './discussion-answer-upvote.exception';

@Injectable()
export class DiscussionAnswerUpvoteService {
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
    data: Prisma.DiscussionAnswerUpvoteCreateInput;
  }): Promise<DiscussionAnswerUpvote> {
    try {
      return await this.prisma.discussionAnswerUpvote.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        DiscussionAnswerUpvoteCreateAlreadyExistsException.throw(this.logger, {
          transactionId,
          data,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      DiscussionAnswerUpvoteCreateException.throw(this.logger, {
        transactionId,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.DiscussionAnswerUpvoteWhereUniqueInput;
  }): Promise<DiscussionAnswerUpvote> {
    try {
      return await this.prisma.discussionAnswerUpvote.delete({
        where,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        DiscussionAnswerUpvoteNotFoundException.throw(this.logger, {
          transactionId,
          where,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      DiscussionAnswerUpvoteDeleteException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
