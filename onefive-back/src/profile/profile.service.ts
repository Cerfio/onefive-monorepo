import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StreakService } from 'src/streak/streak.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  ProfileCreateInternalException,
  ProfileAlreadyExistException,
  ProfileUpdateException,
} from './profile.exception';

type PrismaTransaction = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.ProfileCreateInput;
  }): Promise<Profile> {
    try {
      return await this.prisma.profile.create({ data });
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2002') {
        ProfileAlreadyExistException.throw(this.logger, {
          transactionId,
          error,
        });
      }
      ProfileCreateInternalException.throw(this.logger, {
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
    tx,
  }: {
    transactionId: string;
    where: Prisma.ProfileWhereUniqueInput;
    select?: Prisma.ProfileSelect;
    tx?: PrismaTransaction;
  }) {
    try {
      const prisma = tx || this.prisma;
      return await prisma.profile.findUnique({ where, select });
    } catch (error: unknown) {
      ProfileCreateInternalException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async list({
    transactionId,
    where,
    select,
    skip,
    take,
  }: {
    transactionId: string;
    where?: Prisma.ProfileWhereInput;
    select?: Prisma.ProfileSelect;
    skip?: number;
    take?: number;
  }) {
    try {
      return await this.prisma.profile.findMany({ where, select, skip, take });
    } catch (error: unknown) {
      ProfileCreateInternalException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async getStreak({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }): Promise<number> {
    // Get the user ID from the profile
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    if (!profile) {
      return 0;
    }

    return await this.streakService.getCurrentStreak({
      transactionId,
      userId: profile.userId,
    });
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
    tx,
  }: {
    transactionId: string;
    where: Prisma.ProfileWhereUniqueInput;
    data: Prisma.ProfileUpdateInput;
    tx?: PrismaTransaction;
  }): Promise<Profile> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.profile.update({
        where,
        data,
      });
    } catch (error: unknown) {
      ProfileUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
