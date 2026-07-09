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
} from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';
import { PostDraftService } from './post-draft.service';

@Controller('post-drafts')
@UseGuards(SessionGuard)
export class PostDraftController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: PostDraftService,
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
    @Body() body: { content?: string; tags?: string[] },
  ) {
    const pid = await this.profileId(req.userId);
    return {
      success: true,
      data: await this.service.create(
        pid,
        body?.content ?? '',
        Array.isArray(body?.tags) ? body.tags : [],
      ),
    };
  }

  @Put(':id')
  async update(
    @Req() req: FastifyRequestUserId,
    @Param('id') id: string,
    @Body() body: { content?: string; tags?: string[] },
  ) {
    const pid = await this.profileId(req.userId);
    return {
      success: true,
      data: await this.service.update(
        pid,
        id,
        body?.content ?? '',
        Array.isArray(body?.tags) ? body.tags : [],
      ),
    };
  }

  @Delete(':id')
  async remove(@Req() req: FastifyRequestUserId, @Param('id') id: string) {
    const pid = await this.profileId(req.userId);
    return { success: true, data: await this.service.remove(pid, id) };
  }
}
