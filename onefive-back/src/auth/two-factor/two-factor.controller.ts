import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { TwoFactorService } from './two-factor.service';

@Controller('auth/2fa')
@UseGuards(SessionGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('status')
  async status(@Req() req: FastifyRequestUserId) {
    return { success: true, data: await this.twoFactorService.status(req.userId) };
  }

  @Post('setup')
  async setup(@Req() req: FastifyRequestUserId) {
    return { success: true, data: await this.twoFactorService.setup(req.userId) };
  }

  @Post('enable')
  async enable(
    @Req() req: FastifyRequestUserId,
    @Body() body: { code: string },
  ) {
    return {
      success: true,
      data: await this.twoFactorService.enable(req.userId, body?.code),
    };
  }

  @Post('disable')
  async disable(@Req() req: FastifyRequestUserId) {
    return { success: true, data: await this.twoFactorService.disable(req.userId) };
  }
}
