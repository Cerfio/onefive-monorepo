import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LogService } from 'logstash-winston-3';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { UploadFileHandler } from '../handlers/upload-file.handler';
import { FileHandler } from '../handlers/file.handler';
import { GetFileResponseDto } from '../dto/get-file.dto';
import { UpdateFileResponseDto } from '../dto/update-file.dto';
import { DeleteFileResponseDto } from '../dto/delete-file.dto';

@Controller('dataroom/:dataroomId/file')
@UseGuards(SessionGuard)
export class UploadFileController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly fileHandler: FileHandler,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 10000 },
    long: { limit: 5, ttl: 60000 },
  }) // 5 uploads/min
  async upload(
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ) {
    this.logger.info('Uploading files to dataroom', {
      transactionId: transactionId || req.id,
      dataroomId,
      userId: req.userId,
    });

    return await this.uploadFileHandler.execute({
      transactionId: transactionId || req.id,
      dataroomId,
      userId: req.userId,
      req,
    });
  }

  @Get(':fileId')
  async get(
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query('transactionId') transactionId?: string,
  ): Promise<{ success: true; data: GetFileResponseDto['data'] }> {
    this.logger.info('Getting file', {
      transactionId: transactionId || req.id,
      fileId,
      dataroomId,
      userId: req.userId,
    });

    const result = await this.fileHandler.get({
      fileId,
      profileId: req.userId,
      transactionId: transactionId || req.id,
    });
    return { success: true, data: result.data };
  }

  @Put(':fileId')
  async update(
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Body()
    body: { name?: string; categoryId?: string; transactionId?: string },
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<UpdateFileResponseDto> {
    this.logger.info('Updating file', {
      transactionId: body.transactionId || req.id,
      fileId,
      dataroomId,
      userId: req.userId,
      name: body.name,
      categoryId: body.categoryId,
    });

    return await this.fileHandler.update({
      fileId,
      transactionId: body.transactionId || req.id,
      name: body.name,
      categoryId: body.categoryId,
    });
  }

  @Delete(':fileId')
  async delete(
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query('transactionId') transactionId?: string,
  ): Promise<DeleteFileResponseDto> {
    this.logger.info('Deleting file', {
      transactionId: transactionId || req.id,
      fileId,
      dataroomId,
      userId: req.userId,
    });

    return await this.fileHandler.delete({
      fileId,
      profileId: req.userId,
      transactionId: transactionId || req.id,
    });
  }
}
