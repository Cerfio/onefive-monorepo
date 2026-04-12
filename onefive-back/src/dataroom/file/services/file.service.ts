import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma, DataroomFile } from '@prisma/client';
import {
  FileCreateException,
  FileGetException,
  FileDeleteException,
  FileListException,
  FileNotFoundException,
  FileUpdateException,
} from '../exceptions/file.exception';

@Injectable()
export class FileService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.DataroomFileCreateInput;
  }): Promise<DataroomFile> {
    try {
      return await this.prisma.dataroomFile.create({
        data,
        include: {
          category: true,
        },
      });
    } catch (error) {
      FileCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async createMany({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.DataroomFileCreateManyInput[];
  }) {
    try {
      return await this.prisma.dataroomFile.createMany({
        data,
      });
    } catch (error) {
      FileCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async get({
    transactionId,
    where,
    select,
  }: {
    transactionId: string;
    where: Prisma.DataroomFileWhereUniqueInput;
    select?: Prisma.DataroomFileSelect;
  }): Promise<any> {
    try {
      if (select) {
        return await this.prisma.dataroomFile.findUnique({
          where,
          select,
        });
      } else {
        return await this.prisma.dataroomFile.findUnique({
          where,
          include: { category: true },
        });
      }
    } catch (error) {
      FileGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async list({
    transactionId,
    where,
    skip,
    take,
    orderBy,
  }: {
    transactionId: string;
    where: Prisma.DataroomFileWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.DataroomFileOrderByWithRelationInput;
  }): Promise<any[]> {
    try {
      return await this.prisma.dataroomFile.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
        },
      });
    } catch (error) {
      FileListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async count({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.DataroomFileWhereInput;
  }): Promise<number> {
    try {
      return await this.prisma.dataroomFile.count({
        where,
      });
    } catch (error) {
      FileListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async delete({
    transactionId,
    fileId,
  }: {
    transactionId: string;
    fileId: string;
  }): Promise<DataroomFile> {
    try {
      return await this.prisma.dataroomFile.update({
        where: { id: fileId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      FileDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async hardDelete({
    transactionId,
    fileId,
  }: {
    transactionId: string;
    fileId: string;
  }): Promise<DataroomFile> {
    try {
      return await this.prisma.dataroomFile.delete({
        where: { id: fileId },
      });
    } catch (error) {
      FileDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async update({
    transactionId,
    fileId,
    data,
  }: {
    transactionId: string;
    fileId: string;
    data: Prisma.DataroomFileUpdateInput;
  }): Promise<DataroomFile> {
    try {
      return await this.prisma.dataroomFile.update({
        where: { id: fileId },
        data,
        include: {
          category: true,
        },
      });
    } catch (error) {
      FileUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
