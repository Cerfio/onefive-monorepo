import {
  Controller,
  Get,
  Param,
  Inject,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LogService } from 'logstash-winston-3';
import { RenderHandler } from '../handlers/render.handler';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomMemberGuard } from '../../guards/dataroom-member.guard';

/**
 * Rendu serveur des PDF de data room en images watermarkées (vrai view-only).
 * Le client n'obtient jamais le PDF brut : uniquement des PNG dont le filigrane
 * (identité du lecteur + horodatage) est baké dans les pixels.
 */
@Controller('dataroom/:dataroomId/file/:fileId/render')
@UseGuards(SessionGuard, DataroomMemberGuard)
export class RenderController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly renderHandler: RenderHandler,
  ) {}

  private ctx(
    req: FastifyRequest & FastifyRequestUserId,
    dataroomId: string,
    fileId: string,
  ) {
    const member = (req as any).dataroomMember;
    return {
      transactionId: req.id,
      userId: req.userId,
      dataroomId,
      fileId,
      member: {
        groupId: member.groupId,
        group: { hasAllAccess: member.group.hasAllAccess },
      },
    };
  }

  @Get()
  async info(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
  ): Promise<{
    success: true;
    data: { renderable: boolean; numPages: number; viewOnly: boolean };
  }> {
    const data = await this.renderHandler.getInfo(
      this.ctx(req, dataroomId, fileId),
    );
    return { success: true, data };
  }

  @Get('page/:page')
  async page(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Res() reply: FastifyReply,
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Param('page', ParseIntPipe) page: number,
  ): Promise<void> {
    const png = await this.renderHandler.renderPage(
      this.ctx(req, dataroomId, fileId),
      page,
    );
    reply
      .type('image/png')
      // Images éphémères, propres au lecteur : jamais mises en cache partagée.
      .header('Cache-Control', 'private, no-store')
      .send(png);
  }
}
