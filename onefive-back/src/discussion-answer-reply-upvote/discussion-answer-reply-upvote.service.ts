import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, DiscussionAnswerReplyUpvote } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';

@Injectable()
export class DiscussionAnswerReplyUpvoteService {
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
    data: Prisma.DiscussionAnswerReplyUpvoteCreateInput;
  }): Promise<DiscussionAnswerReplyUpvote> {
    try {
      return await this.prisma.discussionAnswerReplyUpvote.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Upvote already exists');
      }
      throw error;
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.DiscussionAnswerReplyUpvoteWhereUniqueInput;
  }): Promise<DiscussionAnswerReplyUpvote> {
    try {
      return await this.prisma.discussionAnswerReplyUpvote.delete({
        where,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Upvote not found');
      }
      throw error;
    }
  }
}
