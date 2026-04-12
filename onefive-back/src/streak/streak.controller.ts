import { Controller, HttpCode, Post, UseGuards, Req } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { CreateStreakResponseDto } from './dto/streak-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateStreakHandler } from './handlers/create-streak.handler';

@Controller('streak')
@UseGuards(SessionGuard)
export class StreakController {
  constructor(private readonly createStreakHandler: CreateStreakHandler) {}

  @Post()
  @HttpCode(200)
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<CreateStreakResponseDto>> {
    const result = await this.createStreakHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }
}
