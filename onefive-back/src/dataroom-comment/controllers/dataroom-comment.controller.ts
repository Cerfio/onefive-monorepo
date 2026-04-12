import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../../types/fastify-request-user-id';
import { DataroomMemberGuard } from '../../dataroom/guards/dataroom-member.guard';
import { DataroomCommentHandler } from '../handlers/dataroom-comment.handler';
import { CreateDataroomCommentDto } from '../dto/create-dataroom-comment.dto';
import { UpdateDataroomCommentDto } from '../dto/update-dataroom-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('dataroom/:dataroomId/file/:fileId/comments')
@UseGuards(DataroomMemberGuard)
@ApiTags('dataroom-comment')
export class DataroomCommentController {
  constructor(
    private readonly commentHandler: DataroomCommentHandler,
    private readonly prisma: PrismaService,
  ) {}

  private async getProfileIdFromUserId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile.id;
  }

  @Post()
  @HttpCode(201)
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 10000 },
    long: { limit: 30, ttl: 60000 },
  })
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Body() dto: CreateDataroomCommentDto,
  ) {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    return this.commentHandler.create(dataroomId, fileId, profileId, dto);
  }

  @Get()
  async list(
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.commentHandler.list(dataroomId, fileId);
  }

  @Put(':commentId')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 10, ttl: 10000 },
  })
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateDataroomCommentDto,
  ) {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    return this.commentHandler.update(commentId, profileId, dto);
  }

  @Delete(':commentId')
  @HttpCode(200)
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('commentId') commentId: string,
  ) {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    return this.commentHandler.delete(commentId, profileId, dataroomId);
  }
}
