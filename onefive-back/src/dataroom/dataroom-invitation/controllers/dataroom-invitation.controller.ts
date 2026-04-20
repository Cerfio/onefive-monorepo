import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomOwnerGuard } from '../../guards/dataroom-owner.guard';
import { DataroomInvitationService } from '../services/dataroom-invitation.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface CreateInvitationDto {
  groupId: string;
  profileId: string;
  existingUser?: {
    profileInvitedId: string;
  };
  newUser?: {
    email: string;
    firstname: string;
    lastname: string;
    dataroomName: string;
  };
}

// profileId is now derived from req.userId (session), not from client body

@Controller()
@UseGuards(SessionGuard)
export class DataroomInvitationController {
  constructor(
    private readonly dataroomInvitationService: DataroomInvitationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('dataroom/:dataroomId/invitation')
  @UseGuards(DataroomOwnerGuard)
  async createInvitation(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ) {
    const result = await this.dataroomInvitationService.create({
      transactionId: req.id,
      dataroomId,
      userId: req.userId,
      ...createInvitationDto,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Put('dataroom/:dataroomId/invitation/:invitationId/accept')
  async acceptInvitation(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const result = await this.dataroomInvitationService.accept({
      transactionId: req.id,
      invitationId,
      dataroomId,
      userId: req.userId,
      profileId: profile.id,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Put('dataroom/:dataroomId/invitation/:invitationId/decline')
  async declineInvitation(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const result = await this.dataroomInvitationService.decline({
      transactionId: req.id,
      invitationId,
      userId: req.userId,
      profileId: profile.id,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Delete('dataroom/:dataroomId/invitation/:invitationId')
  @UseGuards(DataroomOwnerGuard)
  async deleteInvitation(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const result = await this.dataroomInvitationService.delete({
      transactionId: req.id,
      invitationId,
      userId: req.userId,
      profileId: profile.id,
    });

    return {
      success: true,
      data: result,
    };
  }
}
