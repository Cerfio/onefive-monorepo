import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomGroupService } from '../services/dataroom-group.service';
import { MemberService } from '../../services/member.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface CreateGroupDto {
  name: string;
  hasAllAccess: boolean;
  canUpload: boolean;
  canShare: boolean;
  canManageUsers: boolean;
  canManageGroups: boolean;
}

interface UpdateGroupDto {
  name: string;
}

@Controller('dataroom/:dataroomId/group')
@UseGuards(SessionGuard)
export class DataroomGroupController {
  constructor(
    private readonly dataroomGroupService: DataroomGroupService,
    private readonly memberService: MemberService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const result = await this.dataroomGroupService.create({
      transactionId: req.id,
      dataroomId,
      userId: req.userId,
      name: createGroupDto.name,
      hasAllAccess: createGroupDto.hasAllAccess,
      canUpload: createGroupDto.canUpload,
      canShare: createGroupDto.canShare,
      canManageUsers: createGroupDto.canManageUsers,
      canManageGroups: createGroupDto.canManageGroups,
    });

    return {
      success: true,
      data: {
        id: result.id,
      },
    };
  }

  @Get(':groupId')
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('groupId') groupId: string,
  ) {
    const result = await this.dataroomGroupService.get({
      transactionId: req.id,
      groupId,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Put(':groupId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    const result = await this.dataroomGroupService.update({
      transactionId: req.id,
      dataroomId,
      groupId,
      userId: req.userId,
      name: updateGroupDto.name,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Delete(':groupId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('groupId') groupId: string,
  ) {
    const result = await this.dataroomGroupService.delete({
      transactionId: req.id,
      dataroomId,
      groupId,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Delete(':groupId/member/:memberId')
  async removeMember(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
  ) {
    const group = await this.dataroomGroupService.get({
      transactionId: req.id,
      groupId,
      userId: req.userId,
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        groupId,
        dataroomId,
      },
      select: {
        id: true,
        profileId: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this group');
    }

    const selfProfile = await this.prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });

    if (!selfProfile) {
      throw new NotFoundException('Profile not found');
    }

    if (member.profileId === selfProfile.id) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous retirer vous-même depuis cette action. Utilisez "Quitter la dataroom".',
      );
    }

    const result = await this.memberService.delete({
      transactionId: req.id,
      memberId: member.id,
    });

    return {
      success: true,
      data: result,
    };
  }
}
