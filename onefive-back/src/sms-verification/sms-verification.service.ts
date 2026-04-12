import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import { Prisma } from '@prisma/client';
import { Twilio } from 'twilio';
import {
  SmsVerificationCreateException,
  SmsVerificationGetException,
  SmsVerificationFindManyException,
  SmsVerificationDeleteException,
} from './sms-verification.exception';

@Injectable()
export class SmsVerificationService {
  private twilioClient: Twilio;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject('Logger') private readonly logger: LogService,
  ) {
    this.twilioClient = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.SmsVerificationUncheckedCreateInput;
  }) {
    try {
      return await this.prisma.smsVerification.create({
        data,
      });
    } catch (error) {
      SmsVerificationCreateException.throw(this.logger, {
        transactionId,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async upsert({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      phoneNumber: string;
      userId: string;
      smsCode: string;
      codeExpiresAt: Date;
    };
  }) {
    try {
      return await this.prisma.smsVerification.upsert({
        where: { userId: data.userId },
        create: {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          smsCode: data.smsCode,
          codeExpiresAt: data.codeExpiresAt,
        },
        update: {
          phoneNumber: data.phoneNumber,
          smsCode: data.smsCode,
          codeExpiresAt: data.codeExpiresAt,
        },
      });
    } catch (error) {
      SmsVerificationCreateException.throw(this.logger, {
        transactionId,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.SmsVerificationWhereUniqueInput;
  }) {
    try {
      return await this.prisma.smsVerification.findUnique({
        where,
      });
    } catch (error) {
      SmsVerificationGetException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async findMany({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.SmsVerificationWhereInput;
  }) {
    try {
      return await this.prisma.smsVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      SmsVerificationFindManyException.throw(this.logger, {
        transactionId,
        where,
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
    where: Prisma.SmsVerificationWhereUniqueInput;
  }) {
    try {
      return await this.prisma.smsVerification.delete({
        where,
      });
    } catch (error) {
      SmsVerificationDeleteException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async deleteMany({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.SmsVerificationWhereInput;
  }) {
    try {
      return await this.prisma.smsVerification.deleteMany({
        where,
      });
    } catch (error) {
      SmsVerificationDeleteException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
