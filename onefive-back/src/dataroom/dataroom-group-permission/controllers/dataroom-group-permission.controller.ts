import { Controller, Body, Param, Req, Put, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomOwnerGuard } from '../../guards/dataroom-owner.guard';
import { DataroomGroupPermissionService } from '../services/dataroom-group-permission.service';
import { UpdateDataroomGroupPermissionDto } from '../dto/update-dataroom-group-permission.dto';

@Controller('dataroom/:dataroomId/group/:groupId/permissions')
@UseGuards(SessionGuard, DataroomOwnerGuard)
export class DataroomGroupPermissionController {
  constructor(
    private readonly dataroomGroupPermissionService: DataroomGroupPermissionService,
  ) {}

  @Put()
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('dataroomId') dataroomId: string,
    @Param('groupId') groupId: string,
    @Body() updatePermissionDto: UpdateDataroomGroupPermissionDto,
  ) {
    const result = await this.dataroomGroupPermissionService.update({
      transactionId: req.id,
      groupId,
      userId: req.userId,
      permissions: updatePermissionDto.permissions,
      dataroomId,
    });

    return {
      success: true,
    };
  }
}
