import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  UserSettingsGetException,
  UserSettingsUpdateException,
  UserSettingsCreateException,
} from './user-settings.exception';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserSettingsService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async getUserSettings({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      const settings = await this.prisma.userSettings.findUnique({
        where: { userId },
      });

      return settings;
    } catch (error) {
      UserSettingsGetException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async createDefaultSettings({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      return await this.prisma.userSettings.create({
        data: {
          userId,
        },
      });
    } catch (error) {
      UserSettingsCreateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async updateNotifications({
    transactionId,
    userId,
    data,
  }: {
    transactionId: string;
    userId: string;
    data: Prisma.UserSettingsUpdateInput;
  }) {
    try {
      return await this.prisma.userSettings.update({
        where: { userId },
        data,
      });
    } catch (error) {
      UserSettingsUpdateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async updatePrivacy({
    transactionId,
    userId,
    data,
  }: {
    transactionId: string;
    userId: string;
    data: Prisma.UserSettingsUpdateInput;
  }) {
    try {
      return await this.prisma.userSettings.update({
        where: { userId },
        data,
      });
    } catch (error) {
      UserSettingsUpdateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async updatePreferences({
    transactionId,
    userId,
    data,
  }: {
    transactionId: string;
    userId: string;
    data: Prisma.UserSettingsUpdateInput;
  }) {
    try {
      return await this.prisma.userSettings.update({
        where: { userId },
        data,
      });
    } catch (error) {
      UserSettingsUpdateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async updateLastPasswordChange({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      return await this.prisma.userSettings.update({
        where: { userId },
        data: {
          lastPasswordChange: new Date(),
        },
      });
    } catch (error) {
      UserSettingsUpdateException.throw(this.logger, { transactionId, error });
    }
  }
}
