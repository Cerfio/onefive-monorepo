import { Inject, Injectable } from '@nestjs/common';
import { Prisma, File } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  FileCreateException,
  FileGetException,
  FileDeleteException,
} from './file.exception';

type PrismaTransaction = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
    tx,
  }: {
    transactionId: string;
    data: Prisma.FileCreateInput;
    tx?: PrismaTransaction;
  }): Promise<File> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.file.create({ data });
    } catch (error: unknown) {
      FileCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    fileId,
    tx,
  }: {
    transactionId: string;
    fileId: string;
    tx?: PrismaTransaction;
  }): Promise<File | null> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.file.findUnique({
        where: { id: fileId },
      });
    } catch (error: unknown) {
      FileGetException.throw(this.logger, {
        transactionId,
        fileId,
        error,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    fileId,
    tx,
  }: {
    transactionId: string;
    fileId: string;
    tx?: PrismaTransaction;
  }): Promise<File> {
    try {
      const prisma = tx || this.prisma;
      return await prisma.file.delete({
        where: { id: fileId },
      });
    } catch (error: unknown) {
      FileDeleteException.throw(this.logger, {
        transactionId,
        fileId,
        error,
      });
    }
  }
}
