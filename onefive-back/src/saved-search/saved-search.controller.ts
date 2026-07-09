import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';
import { SavedSearchService } from './saved-search.service';

@Controller('spotlight/saved-searches')
@UseGuards(SessionGuard)
export class SavedSearchController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: SavedSearchService,
  ) {}

  private async profileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile.id;
  }

  @Get()
  async list(@Req() req: FastifyRequestUserId) {
    const pid = await this.profileId(req.userId);
    return { success: true, data: await this.service.listMine(pid) };
  }

  @Post()
  async create(
    @Req() req: FastifyRequestUserId,
    @Body() body: { label?: string; filters?: Record<string, unknown> },
  ) {
    if (!body?.label?.trim()) {
      throw new BadRequestException('label is required');
    }
    const pid = await this.profileId(req.userId);
    return {
      success: true,
      data: await this.service.create(
        pid,
        body.label.trim().slice(0, 120),
        (body.filters ?? {}) as any,
      ),
    };
  }

  @Delete(':id')
  async remove(
    @Req() req: FastifyRequestUserId,
    @Param('id') id: string,
  ) {
    const pid = await this.profileId(req.userId);
    return { success: true, data: await this.service.remove(pid, id) };
  }
}
