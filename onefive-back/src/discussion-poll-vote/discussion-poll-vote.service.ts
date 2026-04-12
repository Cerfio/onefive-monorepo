import { Inject, Injectable } from '@nestjs/common';
import { Prisma, DiscussionPollVote } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import {
  DiscussionPollVoteCreateAlreadyExistsException,
  DiscussionPollVoteCreateException,
} from './discussion-poll-vote.exception';

@Injectable()
export class DiscussionPollVoteService {
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
    data: Prisma.DiscussionPollVoteCreateInput;
  }) {
    try {
      return await this.prisma.discussionPollVote.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        DiscussionPollVoteCreateAlreadyExistsException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      DiscussionPollVoteCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async createMany({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.DiscussionPollVoteCreateManyInput[];
  }) {
    try {
      return await this.prisma.discussionPollVote.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error: any) {
      DiscussionPollVoteCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async deleteMany({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.DiscussionPollVoteWhereInput;
  }) {
    try {
      return await this.prisma.discussionPollVote.deleteMany({
        where,
      });
    } catch (error: any) {
      DiscussionPollVoteCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async count({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.DiscussionPollVoteWhereInput;
  }) {
    try {
      return await this.prisma.discussionPollVote.count({
        where,
      });
    } catch (error: any) {
      DiscussionPollVoteCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
