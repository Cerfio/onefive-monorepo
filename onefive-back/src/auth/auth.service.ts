import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Prisma } from '@prisma/client';
import {
  AuthenticationCreateException,
  AuthenticationEmailAlreadyExistException,
  AuthenticationGetException,
  AuthenticationUpdateException,
} from './auth.exception';

@Injectable()
export class AuthService {
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
    data: Prisma.UserCreateInput;
  }): Promise<Prisma.UserGetPayload<{}>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          authType: data.authType,
          isEmailVerified: data.isEmailVerified,
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        AuthenticationEmailAlreadyExistException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      AuthenticationCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<Prisma.UserGetPayload<{}> | null> {
    try {
      const authentication = await this.prisma.user.findUnique({
        where,
      });
      return authentication;
    } catch (error) {
      AuthenticationGetException.throw(this.logger, {
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
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<Prisma.UserGetPayload<{}>> {
    try {
      const authentication = await this.prisma.user.update({
        where,
        data,
      });
      return authentication;
    } catch (error) {
      AuthenticationUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
