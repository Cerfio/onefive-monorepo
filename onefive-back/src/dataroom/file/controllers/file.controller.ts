import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  Inject,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FileHandler } from '../handlers/file.handler';
import { CreateFileDto, CreateFileResponseDto } from '../dto/create-file.dto';
import { GetFileDto, GetFileResponseDto } from '../dto/get-file.dto';
import { ListFilesDto, ListFilesResponseDto } from '../dto/list-files.dto';
import { DeleteFileDto, DeleteFileResponseDto } from '../dto/delete-file.dto';
import { UpdateFileDto, UpdateFileResponseDto } from '../dto/update-file.dto';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('dataroom/files')
@UseGuards(SessionGuard)
@ApiTags('dataroom-files')
export class FileController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly fileHandler: FileHandler,
  ) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Body() createFileDto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    // Override client-provided profileId with authenticated user
    createFileDto.profileId = req.userId;

    this.logger.info('Creating files', {
      transactionId: createFileDto.transactionId,
      dataroomId: createFileDto.dataroomId,
      profileId: req.userId,
      fileCount: createFileDto.files.length,
    });

    return await this.fileHandler.create(createFileDto);
  }

  @Get(':fileId')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('fileId') fileId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<GetFileResponseDto> {
    const profileId = req.userId;

    this.logger.info('Getting file', {
      transactionId,
      fileId,
      profileId,
    });

    const getFileDto: GetFileDto = {
      fileId,
      profileId,
      transactionId,
    };

    return await this.fileHandler.get(getFileDto);
  }

  @Get()
  @ApiQuery({ name: 'dataroomId', required: true, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt_asc', 'createdAt_desc'],
  })
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Query(ValidationPipe) query: ListFilesDto,
  ): Promise<ListFilesResponseDto> {
    const profileId = req.userId;

    this.logger.info('Listing files', {
      transactionId: query.transactionId,
      dataroomId: query.dataroomId,
      profileId,
      categoryId: query.categoryId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
    });

    const listFilesDto: ListFilesDto = {
      dataroomId: query.dataroomId,
      profileId,
      categoryId: query.categoryId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
      transactionId: query.transactionId,
    };

    return await this.fileHandler.list(listFilesDto);
  }

  @Put(':fileId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('fileId') fileId: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<UpdateFileResponseDto> {
    const profileId = req.userId;

    this.logger.info('Updating file', {
      transactionId: updateFileDto.transactionId,
      fileId,
      profileId,
      name: updateFileDto.name,
      categoryId: updateFileDto.categoryId,
    });

    const updateFileRequestDto = {
      fileId,
      profileId,
      transactionId: updateFileDto.transactionId,
      name: updateFileDto.name,
      categoryId: updateFileDto.categoryId,
    };

    return await this.fileHandler.update(updateFileRequestDto);
  }

  @Delete(':fileId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('fileId') fileId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<DeleteFileResponseDto> {
    const profileId = req.userId;

    this.logger.info('Deleting file', {
      transactionId,
      fileId,
      profileId,
    });

    const deleteFileDto: DeleteFileDto = {
      fileId,
      profileId,
      transactionId,
    };

    return await this.fileHandler.delete(deleteFileDto);
  }
}
