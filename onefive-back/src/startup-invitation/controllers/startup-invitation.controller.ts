import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateStartupInvitationHandler } from '../handlers/create-invitation.handler';
import { ListStartupInvitationsHandler } from '../handlers/list-invitations.handler';
import { RespondStartupInvitationHandler } from '../handlers/respond-invitation.handler';
import { CancelStartupInvitationHandler } from '../handlers/cancel-invitation.handler';
import { CreateStartupInvitationDto } from '../dto/create-startup-invitation.dto';
import { SessionGuard } from '../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { ApiResponseDto, ApiSuccessResponseDto } from '../../common/dto';

@Controller('startup')
@UseGuards(SessionGuard)
export class StartupInvitationController {
  constructor(
    private readonly createInvitationHandler: CreateStartupInvitationHandler,
    private readonly listInvitationsHandler: ListStartupInvitationsHandler,
    private readonly respondInvitationHandler: RespondStartupInvitationHandler,
    private readonly cancelInvitationHandler: CancelStartupInvitationHandler,
  ) {}

  @Post('invite')
  async createInvitation(
    @Req() req: FastifyRequestUserId,
    @Body() body: CreateStartupInvitationDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.createInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Get('invitations')
  async listInvitations(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listInvitationsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  @Put('invitations/:invitationId/accept')
  async acceptInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
      action: 'accept',
    });
    return { success: true, data: result };
  }

  @Put('invitations/:invitationId/decline')
  async declineInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
      action: 'decline',
    });
    return { success: true, data: result };
  }

  @Put('invitations/:invitationId/cancel')
  async cancelInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.cancelInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
    });
    return { success: true, data: result };
  }
}
