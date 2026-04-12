import { Inject, Injectable } from '@nestjs/common';
import { Prisma, DiscussionAnswer } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import {
  DiscussionAnswerCreateException,
  DiscussionAnswerUpdateException,
  DiscussionAnswerDeleteException,
  DiscussionAnswerNotFoundException,
} from './discussion-answer.exception';

@Injectable()
export class DiscussionAnswerService {
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
    data: Prisma.DiscussionAnswerCreateInput;
  }): Promise<DiscussionAnswer> {
    try {
      return await this.prisma.discussionAnswer.create({
        data,
      });
    } catch (error) {
      DiscussionAnswerCreateException.throw(this.logger, {
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
    where: Prisma.DiscussionAnswerWhereUniqueInput;
    select?: Prisma.DiscussionAnswerSelect;
  }) {
    try {
      return await this.prisma.discussionAnswer.findUnique({
        where,
        select,
      });
    } catch (error) {
      DiscussionAnswerNotFoundException.throw(this.logger, {
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
    where: Prisma.DiscussionAnswerWhereUniqueInput;
    data: Prisma.DiscussionAnswerUpdateInput;
  }): Promise<DiscussionAnswer> {
    try {
      return await this.prisma.discussionAnswer.update({
        where,
        data,
      });
    } catch (error) {
      DiscussionAnswerUpdateException.throw(this.logger, {
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
    where: Prisma.DiscussionAnswerWhereUniqueInput;
  }): Promise<DiscussionAnswer> {
    try {
      return await this.prisma.discussionAnswer.delete({
        where,
      });
    } catch (error) {
      DiscussionAnswerDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
