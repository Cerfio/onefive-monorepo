import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';
import { SpotlightFavoriteService } from './spotlight-favorite.service';

@Controller('spotlight')
@UseGuards(SessionGuard)
export class SpotlightFavoriteController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: SpotlightFavoriteService,
  ) {}

  private async profileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile.id;
  }

  @Get('favorites')
  async listFavorites(@Req() req: FastifyRequestUserId) {
    const pid = await this.profileId(req.userId);
    return { success: true, data: await this.service.listMine(pid) };
  }

  @Post('favorites/:spotId/toggle')
  async toggleFavorite(
    @Req() req: FastifyRequestUserId,
    @Param('spotId') spotId: string,
  ) {
    const pid = await this.profileId(req.userId);
    return { success: true, data: await this.service.toggle(pid, spotId) };
  }

  @Post('social-proof')
  async socialProof(
    @Req() req: FastifyRequestUserId,
    @Body() body: { spotIds: string[] },
  ) {
    const pid = await this.profileId(req.userId);
    return {
      success: true,
      data: await this.service.socialProof(pid, body?.spotIds || []),
    };
  }
}
