import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma } from '@prisma/client';
import { Log } from '../common/logger/logger.decorator';
import { FeedbackCreateException } from './feedback.exception';

@Injectable()
export class FeedbackService {
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
    data: Prisma.FeedbackCreateInput;
  }) {
    try {
      return await this.prisma.feedback.create({ data });
    } catch (error) {
      FeedbackCreateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async list({
    transactionId,
    skip = 0,
    take = 20,
    status,
    type,
  }: {
    transactionId: string;
    skip?: number;
    take?: number;
    status?: string;
    type?: string;
  }) {
    const where: Prisma.FeedbackWhereInput = {};
    if (status) where.status = status as any;
    if (type) where.type = type as any;

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              avatarId: true,
            },
          },
          screenshot: {
            select: { id: true },
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { data, total };
  }

  @Log()
  async findById({
    transactionId,
    feedbackId,
  }: {
    transactionId: string;
    feedbackId: string;
  }) {
    return this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        reporter: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
        screenshot: {
          select: { id: true, bucket: true, mimeType: true },
        },
      },
    });
  }

  @Log()
  async updateStatus({
    transactionId,
    feedbackId,
    status,
  }: {
    transactionId: string;
    feedbackId: string;
    status: 'RESOLVED' | 'DISMISSED';
  }) {
    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });
  }

  @Log()
  async countPending(): Promise<number> {
    return this.prisma.feedback.count({ where: { status: 'PENDING' } });
  }
}
