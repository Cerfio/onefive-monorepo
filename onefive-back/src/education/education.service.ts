import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Education } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  EducationCreateException,
  EducationUpdateException,
  EducationGetException,
  EducationNotFoundException,
  EducationUnauthorizedException,
} from './education.exception';

type PrismaTransaction = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

@Injectable()
export class EducationService {
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
    data: Prisma.EducationCreateInput;
  }): Promise<Education> {
    try {
      return await this.prisma.education.create({ data });
    } catch (error: unknown) {
      EducationCreateException.throw(this.logger, {
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
    where: Prisma.EducationWhereUniqueInput;
    data: Prisma.EducationUpdateInput;
    tx?: PrismaTransaction;
  }): Promise<Education> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.education.update({
        where,
        data,
      });
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2025') {
        EducationNotFoundException.throw(this.logger, {
          transactionId,
          where,
          error,
        });
      }
      EducationUpdateException.throw(this.logger, {
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
    where: Prisma.EducationWhereUniqueInput;
    tx?: PrismaTransaction;
  }): Promise<Education> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.education.delete({
        where,
      });
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2025') {
        EducationNotFoundException.throw(this.logger, {
          transactionId,
          where,
          error,
        });
      }
      EducationUpdateException.throw(this.logger, {
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
    where: Prisma.EducationWhereUniqueInput;
    select?: Prisma.EducationSelect;
    tx?: PrismaTransaction;
  }) {
    try {
      const prisma = tx || this.prisma;
      const education = await prisma.education.findUnique({ where, select });
      if (!education) {
        EducationNotFoundException.throw(this.logger, {
          transactionId,
          where,
        });
      }
      return education;
    } catch (error: unknown) {
      EducationGetException.throw(this.logger, {
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
    where?: Prisma.EducationWhereInput;
    select?: Prisma.EducationSelect;
    skip?: number;
    take?: number;
    orderBy?: Prisma.EducationOrderByWithRelationInput;
  }) {
    try {
      return await this.prisma.education.findMany({
        where,
        select,
        skip,
        take,
        orderBy,
      });
    } catch (error: unknown) {
      EducationGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async batchUpdate({
    transactionId,
    userId,
    educations,
    deleteIds,
  }: {
    transactionId: string;
    userId: string;
    educations: Array<{
      id?: string;
      data: Prisma.EducationCreateInput | Prisma.EducationUpdateInput;
    }>;
    deleteIds: string[];
  }): Promise<{
    created: number;
    updated: number;
    deleted: number;
    createdEducations: Array<{ index: number; id: string }>;
  }> {
    let created = 0;
    let updated = 0;
    let deleted = 0;
    const createdEducations: Array<{ index: number; id: string }> = [];

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const educationId of deleteIds) {
          const deleteResult = await tx.education.deleteMany({
            where: {
              id: educationId,
              profile: { userId },
            },
          });

          if (deleteResult.count === 0) {
            EducationUnauthorizedException.throw(this.logger, {
              transactionId,
              educationId,
              userId,
              message: 'Education not found or unauthorized to delete',
            });
          }
          deleted++;
        }

        for (let i = 0; i < educations.length; i++) {
          const education = educations[i];

          if (education.id) {
            const updateResult = await tx.education.updateMany({
              where: {
                id: education.id,
                profile: { userId },
              },
              data: education.data,
            });

            if (updateResult.count === 0) {
              EducationUnauthorizedException.throw(this.logger, {
                transactionId,
                educationId: education.id,
                userId,
                message: 'Education not found or unauthorized to update',
              });
            }
            updated++;
          } else {
            const newEducation = await tx.education.create({
              data: {
                ...(education.data as Prisma.EducationCreateInput),
                profile: {
                  connect: { userId },
                },
              },
            });
            createdEducations.push({ index: i, id: newEducation.id });
            created++;
          }
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      EducationUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }

    return { created, updated, deleted, createdEducations };
  }

  @Log()
  async updateWithOwnershipCheck({
    transactionId,
    userId,
    educationId,
    data,
  }: {
    transactionId: string;
    userId: string;
    educationId: string;
    data: Prisma.EducationUpdateInput;
  }): Promise<Education> {
    try {
      const updateResult = await this.prisma.education.updateMany({
        where: {
          id: educationId,
          profile: { userId },
        },
        data,
      });

      if (updateResult.count === 0) {
        EducationUnauthorizedException.throw(this.logger, {
          transactionId,
          educationId,
          userId,
          message: 'Education not found or unauthorized to update',
        });
      }

      const updatedEducation = await this.prisma.education.findUnique({
        where: { id: educationId },
      });

      if (!updatedEducation) {
        EducationNotFoundException.throw(this.logger, {
          transactionId,
          educationId,
        });
      }

      return updatedEducation;
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      EducationUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async deleteWithOwnershipCheck({
    transactionId,
    userId,
    educationId,
  }: {
    transactionId: string;
    userId: string;
    educationId: string;
  }): Promise<void> {
    try {
      const deleteResult = await this.prisma.education.deleteMany({
        where: {
          id: educationId,
          profile: { userId },
        },
      });

      if (deleteResult.count === 0) {
        EducationUnauthorizedException.throw(this.logger, {
          transactionId,
          educationId,
          userId,
          message: 'Education not found or unauthorized to delete',
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }

      EducationUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
