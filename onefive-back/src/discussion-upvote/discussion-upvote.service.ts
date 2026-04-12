import { Inject, Injectable } from '@nestjs/common';
import { Prisma, DiscussionUpvote } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import {
  DiscussionUpvoteCreateAlreadyExistsException,
  DiscussionUpvoteCreateException,
  DiscussionUpvoteDeleteException,
} from './discussion-upvote.exception';

@Injectable()
export class DiscussionUpvoteService {
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
    data: Prisma.DiscussionUpvoteCreateInput;
  }) {
    try {
      return await this.prisma.discussionUpvote.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        DiscussionUpvoteDeleteException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      if (error.code === 'P2002') {
        DiscussionUpvoteCreateAlreadyExistsException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      DiscussionUpvoteCreateException.throw(this.logger, {
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
    where: Prisma.DiscussionUpvoteWhereUniqueInput;
  }) {
    try {
      return await this.prisma.discussionUpvote.delete({
        where,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        DiscussionUpvoteDeleteException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      DiscussionUpvoteDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
