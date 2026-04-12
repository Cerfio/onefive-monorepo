import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { Prisma } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.MemberCreateInput;
  }) {
    try {
      return await this.prisma.member.create({
        data,
      });
    } catch (error) {
      this.logger.error('Member creation failed', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }

  @Log()
  async findByProfileAndDataroom({
    transactionId,
    profileId,
    dataroomId,
  }: {
    transactionId: string;
    profileId: string;
    dataroomId: string;
  }) {
    try {
      return await this.prisma.member.findFirst({
        where: {
          profileId,
          dataroomId,
        },
        include: {
          group: true,
        },
      });
    } catch (error) {
      this.logger.error('Member retrieval failed', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }

  @Log()
  async delete({
    transactionId,
    memberId,
  }: {
    transactionId: string;
    memberId: string;
  }) {
    try {
      return await this.prisma.member.delete({
        where: {
          id: memberId,
        },
      });
    } catch (error) {
      this.logger.error('Member deletion failed', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }
}
