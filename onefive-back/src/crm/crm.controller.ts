import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';
import { CrmService } from './crm.service';

@Controller('crm')
@UseGuards(SessionGuard)
export class CrmController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crmService: CrmService,
  ) {}

  private async profileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile.id;
  }

  @Get('pipeline')
  async pipeline(@Req() req: FastifyRequestUserId) {
    const owner = await this.profileId(req.userId);
    return { success: true, data: await this.crmService.getPipeline(owner) };
  }

  @Get('contact/:contactId')
  async getContact(@Req() req: FastifyRequestUserId, @Param('contactId') contactId: string) {
    const owner = await this.profileId(req.userId);
    return { success: true, data: await this.crmService.getForContact(owner, contactId) };
  }

  @Put('contact/:contactId/stage')
  async setStage(
    @Req() req: FastifyRequestUserId,
    @Param('contactId') contactId: string,
    @Body() body: { stage: string },
  ) {
    const owner = await this.profileId(req.userId);
    return { success: true, data: await this.crmService.setStage(owner, contactId, body?.stage) };
  }

  @Post('contact/:contactId/notes')
  async addNote(
    @Req() req: FastifyRequestUserId,
    @Param('contactId') contactId: string,
    @Body() body: { content: string },
  ) {
    const owner = await this.profileId(req.userId);
    return { success: true, data: await this.crmService.addNote(owner, contactId, body?.content) };
  }

  @Post('contact/:contactId/reminders')
  async addReminder(
    @Req() req: FastifyRequestUserId,
    @Param('contactId') contactId: string,
    @Body() body: { reason: string; dueAt: string },
  ) {
    const owner = await this.profileId(req.userId);
    return {
      success: true,
      data: await this.crmService.addReminder(owner, contactId, body?.reason, body?.dueAt),
    };
  }

  @Put('reminders/:reminderId/complete')
  async completeReminder(
    @Req() req: FastifyRequestUserId,
    @Param('reminderId') reminderId: string,
  ) {
    const owner = await this.profileId(req.userId);
    return { success: true, data: await this.crmService.completeReminder(owner, reminderId) };
  }
}
