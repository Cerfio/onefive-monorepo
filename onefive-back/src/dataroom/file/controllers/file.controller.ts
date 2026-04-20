import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FileHandler } from '../handlers/file.handler';
import { ListFilesDto, ListFilesResponseDto } from '../dto/list-files.dto';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

/**
 * Lists files in a dataroom.
 *
 * Note: mutation routes (POST/GET/:id/PUT/DELETE) were removed — use the scoped
 * `/dataroom/:dataroomId/file(/...)` routes (UploadFileController) which enforce
 * membership via DataroomMemberGuard.
 */
@Controller('dataroom/files')
@UseGuards(SessionGuard)
@ApiTags('dataroom-files')
export class FileController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly fileHandler: FileHandler,
    private readonly prisma: PrismaService,
  ) {}

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
    const profile = await this.prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const member = await this.prisma.member.findFirst({
      where: { profileId: profile.id, dataroomId: query.dataroomId },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this dataroom');
    }

    this.logger.info('Listing files', {
      transactionId: query.transactionId,
      dataroomId: query.dataroomId,
      profileId: profile.id,
      categoryId: query.categoryId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
    });

    return await this.fileHandler.list({
      dataroomId: query.dataroomId,
      profileId: profile.id,
      categoryId: query.categoryId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
      transactionId: query.transactionId,
    });
  }
}
