import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma, PostView } from '@prisma/client';
import { PostViewCreateException } from './post-view.exception';
import { Log } from '../common/logger/logger.decorator';

@Injectable()
export class PostViewService {
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
    data: Prisma.PostViewCreateInput;
  }): Promise<PostView> {
    try {
      return this.prisma.postView.create({
        data,
      });
    } catch (error) {
      PostViewCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
