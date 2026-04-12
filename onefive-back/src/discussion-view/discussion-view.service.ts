import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma, DiscussionView } from '@prisma/client';
import { DiscussionViewCreateException } from './discussion-view.exception';
import { Log } from '../common/logger/logger.decorator';

@Injectable()
export class DiscussionViewService {
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
    data: Prisma.DiscussionViewCreateInput;
  }): Promise<DiscussionView> {
    try {
      return this.prisma.discussionView.create({
        data,
      });
    } catch (error) {
      DiscussionViewCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
