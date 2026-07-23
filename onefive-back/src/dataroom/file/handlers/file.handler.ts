import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FileService } from '../services/file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFileDto, CreateFileResponseDto } from '../dto/create-file.dto';
import { GetFileDto, GetFileResponseDto } from '../dto/get-file.dto';
import { ListFilesDto, ListFilesResponseDto } from '../dto/list-files.dto';
import { DeleteFileDto, DeleteFileResponseDto } from '../dto/delete-file.dto';
import { UpdateFileDto, UpdateFileResponseDto } from '../dto/update-file.dto';
import { FileNotFoundException } from '../exceptions/file.exception';

@Injectable()
export class FileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  async create(input: CreateFileDto): Promise<CreateFileResponseDto> {
    const files = [];

    for (const file of input.files) {
      const createdFile = await this.fileService.create({
        transactionId: input.transactionId,
        data: {
          dataroom: {
            connect: {
              id: input.dataroomId,
            },
          },
          storageId: file.storageId,
          name: file.name,
          size: file.size,
          mimetype: file.mimetype,
          category: {
            connectOrCreate: {
              where: {
                name_dataroomId: {
                  name: file.category,
                  dataroomId: input.dataroomId,
                },
              },
              create: {
                name: file.category,
                dataroom: {
                  connect: {
                    id: input.dataroomId,
                  },
                },
                createdBy: input.profileId,
              },
            },
          },
          isDeleted: false,
          uploadedBy: input.profileId,
        },
      });
      files.push(createdFile);
    }

    return {
      data: {
        files: files.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          mimetype: file.mimetype,
          storageId: file.storageId,
        })),
      },
    };
  }

  async get(input: GetFileDto): Promise<GetFileResponseDto> {
    const file = await this.fileService.get({
      transactionId: input.transactionId,
      where: { id: input.fileId, dataroomId: input.dataroomId },
    });

    if (!file) {
      FileNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    return {
      data: {
        id: file.id,
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        storageId: file.storageId,
        category: {
          id: file.category.id,
          name: file.category.name,
        },
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      },
    };
  }

  async list(input: ListFilesDto): Promise<ListFilesResponseDto> {
    const where: any = {
      dataroomId: input.dataroomId,
      isDeleted: false,
    };

    if (input.categoryId) {
      where.categoryId = input.categoryId;
    }

    const skip = input.skip ?? 0;
    const take = input.take ?? 20;
    const orderBy =
      input.orderBy === 'createdAt_asc'
        ? { createdAt: 'asc' as const }
        : { createdAt: 'desc' as const };

    const files = await this.fileService.list({
      transactionId: input.transactionId,
      where,
      skip,
      take,
      orderBy,
    });

    const total = await this.fileService.count({
      transactionId: input.transactionId,
      where,
    });

    const mappedFiles = files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      storageId: file.storageId,
      viewCount: file._count?.accessLogs ?? 0,
      category: {
        id: file.category.id,
        name: file.category.name,
      },
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    }));

    const page = Math.floor(skip / take) + 1;
    const hasMore = skip + take < total;

    return {
      data: {
        items: mappedFiles,
        files: mappedFiles,
        total,
        page,
        pageSize: take,
        hasMore,
      },
    };
  }

  async delete(input: DeleteFileDto): Promise<DeleteFileResponseDto> {
    const file = await this.fileService.get({
      transactionId: input.transactionId,
      where: { id: input.fileId, dataroomId: input.dataroomId },
    });

    if (!file) {
      FileNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    await this.fileService.delete({
      transactionId: input.transactionId,
      fileId: input.fileId,
    });

    return {
      data: {
        success: true,
      },
    };
  }

  async update(
    input: UpdateFileDto & { fileId: string; dataroomId: string },
  ): Promise<UpdateFileResponseDto> {
    const file = await this.fileService.get({
      transactionId: input.transactionId,
      where: { id: input.fileId, dataroomId: input.dataroomId },
    });

    if (!file) {
      FileNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    const updatedFile = await this.fileService.update({
      transactionId: input.transactionId,
      fileId: input.fileId,
      data: {
        name: input.name,
        category: input.categoryId
          ? {
              connect: {
                id: input.categoryId,
              },
            }
          : undefined,
      },
    });

    return {
      data: {
        id: updatedFile.id,
        name: updatedFile.name,
        categoryId: updatedFile.categoryId,
      },
    };
  }
}
