import { Inject, Injectable } from '@nestjs/common';
import { Prisma, DiscussionReaction } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';
import {
  DiscussionReactionCreateAlreadyExistsException,
  DiscussionReactionCreateException,
  DiscussionReactionDeleteException,
} from './discussion-reaction.exception';

@Injectable()
export class DiscussionReactionService {
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
    data: Prisma.DiscussionReactionCreateInput;
  }): Promise<DiscussionReaction> {
    try {
      return await this.prisma.discussionReaction.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        DiscussionReactionCreateAlreadyExistsException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      DiscussionReactionCreateException.throw(this.logger, {
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
    where: Prisma.DiscussionReactionWhereUniqueInput;
  }): Promise<DiscussionReaction> {
    try {
      return await this.prisma.discussionReaction.delete({
        where,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        DiscussionReactionDeleteException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      DiscussionReactionDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
