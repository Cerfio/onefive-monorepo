import {
  Controller,
  HttpCode,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  Inject,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LogService } from 'logstash-winston-3';
import { DataroomHandler } from '../handlers/dataroom.handler';
import { TrackingEventsHandler } from '../handlers/tracking-events.handler';
import { AnalyticsHandler } from '../handlers/analytics.handler';
import { FileAnalyticsHandler } from '../handlers/file-analytics.handler';
import { UserAnalyticsHandler } from '../handlers/user-analytics.handler';
import { TimelineHandler } from '../handlers/timeline.handler';
import {
  CreateDataroomDto,
  CreateDataroomResponseDto,
} from '../dto/create-dataroom.dto';
import {
  GetDataroomDto,
  GetDataroomResponseDto,
} from '../dto/get-dataroom.dto';
import {
  DeleteDataroomDto,
  DeleteDataroomResponseDto,
} from '../dto/delete-dataroom.dto';
import {
  ListDataroomDto,
  ListDataroomResponseDto,
} from '../dto/list-dataroom.dto';
import {
  SaveTrackingEventsDto,
  SaveTrackingEventsResponseDto,
} from '../dto/tracking-events.dto';
import { GetAnalyticsDto, GetAnalyticsResponseDto } from '../dto/analytics.dto';
import {
  GetFileAnalyticsDto,
  GetFileAnalyticsResponseDto,
} from '../dto/file-analytics.dto';
import {
  GetUserAnalyticsDto,
  GetUserAnalyticsResponseDto,
} from '../dto/user-analytics.dto';
import {
  GetUserTimelineDto,
  GetUserTimelineResponseDto,
  GetDataroomTimelineDto,
  GetDataroomTimelineResponseDto,
} from '../dto/timeline.dto';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../types/fastify-request-user-id';
import { DataroomMemberGuard } from '../guards/dataroom-member.guard';
import { DataroomOwnerGuard } from '../guards/dataroom-owner.guard';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('dataroom')
@UseGuards(SessionGuard)
@ApiTags('dataroom')
export class DataroomController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly dataroomHandler: DataroomHandler,
    private readonly trackingEventsHandler: TrackingEventsHandler,
    private readonly analyticsHandler: AnalyticsHandler,
    private readonly fileAnalyticsHandler: FileAnalyticsHandler,
    private readonly userAnalyticsHandler: UserAnalyticsHandler,
    private readonly timelineHandler: TimelineHandler,
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
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 10000 },
    long: { limit: 5, ttl: 60000 },
  }) // 5 datarooms/min anti-spam
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Body() createDataroomDto: CreateDataroomDto,
  ): Promise<CreateDataroomResponseDto> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    createDataroomDto.createdBy = profileId;

    this.logger.info('Creating dataroom', {
      transactionId: createDataroomDto.transactionId,
      startupId: createDataroomDto.startupId,
      createdBy: profileId,
    });

    return await this.dataroomHandler.create(createDataroomDto);
  }

  @Get(':dataroomId')
  @UseGuards(DataroomMemberGuard)
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<GetDataroomResponseDto> {
    const profileId = await this.getProfileIdFromUserId(req.userId);

    this.logger.info('Getting dataroom', {
      transactionId,
      dataroomId,
      profileId,
    });

    const getDataroomDto: GetDataroomDto = {
      dataroomId,
      profileId,
      transactionId,
    };

    return await this.dataroomHandler.get(getDataroomDto);
  }

  @Delete(':dataroomId')
  @UseGuards(DataroomOwnerGuard)
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<DeleteDataroomResponseDto> {
    this.logger.info('Deleting dataroom', {
      transactionId,
      dataroomId,
      userId: req.userId,
    });

    const deleteDataroomDto: DeleteDataroomDto = {
      dataroomId,
      transactionId,
    };

    return await this.dataroomHandler.delete(deleteDataroomDto);
  }

  @Delete(':dataroomId/leave')
  @UseGuards(DataroomMemberGuard)
  async leave(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
  ) {
    const profileId = await this.getProfileIdFromUserId(req.userId);

    const dataroom = await this.prisma.dataroom.findUnique({
      where: { id: dataroomId },
      select: { id: true, createdBy: true },
    });

    if (!dataroom) {
      throw new NotFoundException('Dataroom not found');
    }

    if (dataroom.createdBy === profileId) {
      throw new BadRequestException(
        "Le propriétaire ne peut pas quitter la dataroom. Supprimez-la ou transférez la propriété d'abord.",
      );
    }

    const [memberships, directAccess] = await Promise.all([
      this.prisma.member.deleteMany({
        where: {
          dataroomId,
          profileId,
        },
      }),
      this.prisma.directAccess.deleteMany({
        where: {
          dataroomId,
          profileId,
        },
      }),
    ]);

    if (memberships.count === 0 && directAccess.count === 0) {
      throw new BadRequestException(
        "Vous n'avez plus d'accès actif à cette dataroom.",
      );
    }

    return {
      success: true,
      data: {
        removedMemberships: memberships.count,
        removedDirectAccess: directAccess.count,
      },
    };
  }

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt_asc', 'createdAt_desc'],
  })
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Query(ValidationPipe) query: ListDataroomDto,
  ): Promise<ListDataroomResponseDto> {
    const profileId = await this.getProfileIdFromUserId(req.userId);

    this.logger.info('Listing datarooms', {
      transactionId: query.transactionId,
      profileId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
    });

    const listDataroomDto: ListDataroomDto = {
      profileId,
      transactionId: query.transactionId,
      skip: query.skip,
      take: query.take,
      orderBy: query.orderBy,
    };

    return await this.dataroomHandler.list(listDataroomDto);
  }

  @Post('tracking/events')
  @HttpCode(200)
  async saveTrackingEvents(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Body() saveTrackingEventsDto: SaveTrackingEventsDto,
  ): Promise<SaveTrackingEventsResponseDto> {
    this.logger.info('Saving tracking events', {
      transactionId: saveTrackingEventsDto.transactionId,
      eventsCount: saveTrackingEventsDto.events.length,
    });

    const profileId = await this.getProfileIdFromUserId(req.userId);

    return await this.trackingEventsHandler.saveEvents(
      saveTrackingEventsDto,
      profileId,
      req.headers['user-agent'],
      req.ip,
    );
  }

  @Get(':dataroomId/analytics')
  @UseGuards(DataroomMemberGuard)
  async getDataroomAnalytics(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Query('period') period?: '24h' | '7d' | '30d' | '90d',
    @Query('transactionId') transactionId?: string,
  ): Promise<GetAnalyticsResponseDto> {
    this.logger.info('Getting dataroom analytics', {
      transactionId,
      dataroomId,
      period,
    });

    const profileId = await this.getProfileIdFromUserId(req.userId);

    const getAnalyticsDto: GetAnalyticsDto = {
      period,
      transactionId,
    };

    return await this.analyticsHandler.getDataroomAnalytics(
      getAnalyticsDto,
      dataroomId,
      profileId,
    );
  }

  @Get(':dataroomId/file/:fileId/analytics')
  @UseGuards(DataroomMemberGuard)
  async getFileAnalytics(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Query('period') period?: '24h' | '7d' | '30d' | '90d',
    @Query('transactionId') transactionId?: string,
  ): Promise<GetFileAnalyticsResponseDto> {
    this.logger.info('Getting file analytics', {
      transactionId,
      dataroomId,
      fileId,
      period,
    });

    const getFileAnalyticsDto: GetFileAnalyticsDto = {
      fileId,
      period,
      transactionId,
    };

    return await this.fileAnalyticsHandler.getFileAnalytics(
      getFileAnalyticsDto,
    );
  }

  @Get(':dataroomId/user/:userId/analytics')
  @UseGuards(DataroomMemberGuard)
  async getUserAnalytics(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('userId') userId: string,
    @Query('period') period?: '24h' | '7d' | '30d' | '90d',
    @Query('transactionId') transactionId?: string,
  ): Promise<GetUserAnalyticsResponseDto> {
    this.logger.info('Getting user analytics', {
      transactionId,
      dataroomId,
      userId,
      period,
    });

    const getUserAnalyticsDto: GetUserAnalyticsDto = {
      userId,
      period,
      transactionId,
    };

    return await this.userAnalyticsHandler.getUserAnalytics(
      getUserAnalyticsDto,
      dataroomId,
    );
  }

  @Get(':dataroomId/user/:userId/timeline')
  @UseGuards(DataroomMemberGuard)
  async getUserTimeline(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('userId') userId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<GetUserTimelineResponseDto> {
    this.logger.info('Getting user timeline', {
      transactionId,
      dataroomId,
      userId,
    });

    const getUserTimelineDto: GetUserTimelineDto = {
      userId,
      transactionId,
    };

    return await this.timelineHandler.getUserTimeline(
      getUserTimelineDto,
      dataroomId,
    );
  }

  @Get(':dataroomId/timeline')
  @UseGuards(DataroomMemberGuard)
  async getDataroomTimeline(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<GetDataroomTimelineResponseDto> {
    this.logger.info('Getting dataroom timeline', {
      transactionId,
      dataroomId,
    });

    const getDataroomTimelineDto: GetDataroomTimelineDto = {
      transactionId,
    };

    return await this.timelineHandler.getDataroomTimeline(
      getDataroomTimelineDto,
      dataroomId,
    );
  }

  // ==================== SHARE LINKS (lien de partage sécurisé) ====================

  @Post(':dataroomId/share-links')
  @UseGuards(DataroomOwnerGuard)
  async createShareLink(
    @Req() req: FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Body()
    body: { groupId: string; requireEmail?: boolean; expiresInDays?: number },
  ): Promise<{ success: true; data: unknown }> {
    if (!body?.groupId) throw new BadRequestException('groupId requis');
    const group = await this.prisma.dataroomGroup.findFirst({
      where: { id: body.groupId, dataroomId },
      select: { id: true },
    });
    if (!group) {
      throw new BadRequestException('Groupe introuvable pour ce dataroom');
    }

    const profileId = await this.getProfileIdFromUserId(req.userId);
    const expiresAt =
      body.expiresInDays && body.expiresInDays > 0
        ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    const link = await this.prisma.dataroomShareLink.create({
      data: {
        dataroomId,
        groupId: body.groupId,
        createdBy: profileId,
        requireEmail: body.requireEmail ?? true,
        expiresAt,
      },
      select: {
        id: true,
        token: true,
        requireEmail: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return { success: true, data: link };
  }

  @Get(':dataroomId/share-links')
  @UseGuards(DataroomOwnerGuard)
  async listShareLinks(
    @Param('dataroomId') dataroomId: string,
  ): Promise<{ success: true; data: unknown }> {
    const links = await this.prisma.dataroomShareLink.findMany({
      where: { dataroomId, isRevoked: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        token: true,
        requireEmail: true,
        expiresAt: true,
        redeemCount: true,
        createdAt: true,
        group: { select: { id: true, name: true } },
      },
    });
    return { success: true, data: links };
  }

  @Delete(':dataroomId/share-links/:linkId')
  @UseGuards(DataroomOwnerGuard)
  async revokeShareLink(
    @Param('dataroomId') dataroomId: string,
    @Param('linkId') linkId: string,
  ): Promise<{ success: true }> {
    await this.prisma.dataroomShareLink.updateMany({
      where: { id: linkId, dataroomId },
      data: { isRevoked: true },
    });
    return { success: true };
  }

  // Rédemption par un utilisateur authentifié : valide le lien (révocation /
  // expiration) puis l'ajoute au groupe cible du dataroom (accès = permissions
  // du groupe). Pas de DataroomMemberGuard : le destinataire n'est pas encore
  // membre. (Feature rouge non E2E-testable ici — à tester manuellement.)
  @Post('share/:token/redeem')
  async redeemShareLink(
    @Req() req: FastifyRequestUserId,
    @Param('token') token: string,
  ): Promise<{ success: true; data: { dataroomId: string } }> {
    const link = await this.prisma.dataroomShareLink.findUnique({
      where: { token },
      select: {
        id: true,
        dataroomId: true,
        groupId: true,
        isRevoked: true,
        expiresAt: true,
      },
    });
    if (!link || link.isRevoked) {
      throw new NotFoundException('Lien invalide ou révoqué');
    }
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Ce lien a expiré');
    }

    const profileId = await this.getProfileIdFromUserId(req.userId);

    const existing = await this.prisma.member.findFirst({
      where: { dataroomId: link.dataroomId, profileId },
      select: { id: true },
    });
    if (!existing) {
      await this.prisma.member.create({
        data: {
          dataroomId: link.dataroomId,
          groupId: link.groupId,
          profileId,
        },
      });
      await this.prisma.dataroomShareLink.update({
        where: { id: link.id },
        data: { redeemCount: { increment: 1 } },
      });
    }

    return { success: true, data: { dataroomId: link.dataroomId } };
  }
}
