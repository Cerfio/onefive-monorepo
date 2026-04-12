import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Experience } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  ExperienceCreateException,
  ExperienceUpdateException,
  ExperienceGetException,
  ExperienceNotFoundException,
  ExperienceUnauthorizedException,
} from './experience.exception';

type PrismaTransaction = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.ExperienceCreateInput;
  }): Promise<Experience> {
    try {
      return await this.prisma.experience.create({ data });
    } catch (error: unknown) {
      ExperienceCreateException.throw(this.logger, {
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
    tx,
  }: {
    transactionId: string;
    where: Prisma.ExperienceWhereUniqueInput;
    data: Prisma.ExperienceUpdateInput;
    tx?: PrismaTransaction;
  }): Promise<Experience> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.experience.update({
        where,
        data,
      });
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2025') {
        ExperienceNotFoundException.throw(this.logger, {
          transactionId,
          where,
          error,
        });
      }
      ExperienceUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
    tx,
  }: {
    transactionId: string;
    where: Prisma.ExperienceWhereUniqueInput;
    tx?: PrismaTransaction;
  }): Promise<Experience> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.experience.delete({
        where,
      });
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2025') {
        ExperienceNotFoundException.throw(this.logger, {
          transactionId,
          where,
          error,
        });
      }
      ExperienceUpdateException.throw(this.logger, {
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
    where: Prisma.ExperienceWhereUniqueInput;
    select?: Prisma.ExperienceSelect;
    tx?: PrismaTransaction;
  }) {
    try {
      const prisma = tx || this.prisma;
      const experience = await prisma.experience.findUnique({ where, select });
      if (!experience) {
        ExperienceNotFoundException.throw(this.logger, {
          transactionId,
          where,
        });
      }
      return experience;
    } catch (error: unknown) {
      ExperienceGetException.throw(this.logger, {
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
    orderBy,
  }: {
    transactionId: string;
    where?: Prisma.ExperienceWhereInput;
    select?: Prisma.ExperienceSelect;
    skip?: number;
    take?: number;
    orderBy?: Prisma.ExperienceOrderByWithRelationInput;
  }) {
    try {
      return await this.prisma.experience.findMany({
        where,
        select,
        skip,
        take,
        orderBy,
      });
    } catch (error: unknown) {
      ExperienceGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async batchUpdate({
    transactionId,
    userId,
    experiences,
    deleteIds,
  }: {
    transactionId: string;
    userId: string;
    experiences: Array<{
      id?: string;
      data: Prisma.ExperienceCreateInput | Prisma.ExperienceUpdateInput;
    }>;
    deleteIds: string[];
  }): Promise<{
    created: number;
    updated: number;
    deleted: number;
    createdExperiences: Array<{ index: number; id: string }>;
  }> {
    let created = 0;
    let updated = 0;
    let deleted = 0;
    const createdExperiences: Array<{ index: number; id: string }> = [];

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const experienceId of deleteIds) {
          const deleteResult = await tx.experience.deleteMany({
            where: {
              id: experienceId,
              profile: { userId },
            },
          });

          if (deleteResult.count === 0) {
            ExperienceUnauthorizedException.throw(this.logger, {
              transactionId,
              experienceId,
              userId,
              message: 'Experience not found or unauthorized to delete',
            });
          }
          deleted++;
        }

        for (let i = 0; i < experiences.length; i++) {
          const experience = experiences[i];

          if (experience.id) {
            const updateResult = await tx.experience.updateMany({
              where: {
                id: experience.id,
                profile: { userId },
              },
              data: experience.data,
            });

            if (updateResult.count === 0) {
              ExperienceUnauthorizedException.throw(this.logger, {
                transactionId,
                experienceId: experience.id,
                userId,
                message: 'Experience not found or unauthorized to update',
              });
            }
            updated++;
          } else {
            const newExperience = await tx.experience.create({
              data: {
                ...(experience.data as Prisma.ExperienceCreateInput),
                profile: {
                  connect: { userId },
                },
              },
            });
            createdExperiences.push({ index: i, id: newExperience.id });
            created++;
          }
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      ExperienceUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }

    return { created, updated, deleted, createdExperiences };
  }

  @Log()
  async updateWithOwnershipCheck({
    transactionId,
    userId,
    experienceId,
    data,
  }: {
    transactionId: string;
    userId: string;
    experienceId: string;
    data: Prisma.ExperienceUpdateInput;
  }): Promise<Experience> {
    try {
      const updateResult = await this.prisma.experience.updateMany({
        where: {
          id: experienceId,
          profile: { userId },
        },
        data,
      });

      if (updateResult.count === 0) {
        ExperienceUnauthorizedException.throw(this.logger, {
          transactionId,
          experienceId,
          userId,
          message: 'Experience not found or unauthorized to update',
        });
      }

      const updatedExperience = await this.prisma.experience.findUnique({
        where: { id: experienceId },
      });

      if (!updatedExperience) {
        ExperienceNotFoundException.throw(this.logger, {
          transactionId,
          experienceId,
        });
      }

      return updatedExperience;
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      ExperienceUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async deleteWithOwnershipCheck({
    transactionId,
    userId,
    experienceId,
  }: {
    transactionId: string;
    userId: string;
    experienceId: string;
  }): Promise<void> {
    try {
      const deleteResult = await this.prisma.experience.deleteMany({
        where: {
          id: experienceId,
          profile: { userId },
        },
      });

      if (deleteResult.count === 0) {
        ExperienceUnauthorizedException.throw(this.logger, {
          transactionId,
          experienceId,
          userId,
          message: 'Experience not found or unauthorized to delete',
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      ExperienceUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
