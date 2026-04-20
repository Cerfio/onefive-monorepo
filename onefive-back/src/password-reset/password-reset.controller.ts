import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';
import { ApiSuccessResponseDto } from '../common/dto/api-response.dto';
import { PasswordResetRequestHandler } from './handlers/password-reset-request.handler';
import { PasswordResetVerifyHandler } from './handlers/password-reset-verify.handler';
import { PasswordResetConfirmHandler } from './handlers/password-reset-confirm.handler';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetVerifyDto } from './dto/password-reset-verify.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Controller('auth/password')
@Public()
@Throttle({
  long: { limit: 3, ttl: 60000 },
})
export class PasswordResetController {
  constructor(
    private readonly requestHandler: PasswordResetRequestHandler,
    private readonly verifyHandler: PasswordResetVerifyHandler,
    private readonly confirmHandler: PasswordResetConfirmHandler,
  ) {}

  @Post('reset/request')
  @HttpCode(200)
  async requestReset(
    @Req() req: FastifyRequest & { id: string },
    @Body() body: PasswordResetRequestDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.requestHandler.execute({
      transactionId: req.id,
      email: body.email,
    });
    return { success: true };
  }

  @Post('reset/verify')
  @HttpCode(200)
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  async verifyCode(
    @Req() req: FastifyRequest & { id: string },
    @Body() body: PasswordResetVerifyDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.verifyHandler.execute({
      transactionId: req.id,
      code: body.code,
      token: body.token,
    });
    return { success: true };
  }

  @Post('reset')
  @HttpCode(200)
  @Throttle({ long: { limit: 3, ttl: 60000 } })
  async resetPassword(
    @Req() req: FastifyRequest & { id: string },
    @Body() body: PasswordResetConfirmDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.confirmHandler.execute({
      transactionId: req.id,
      token: body.token,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });
    return { success: true };
  }
}
