import { Controller, Get, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { GetProfileStatisticsHandler } from './handlers/get-profile-statistics.handler';
import { ProfileStatisticsResponseDto } from './dto/get-profile-statistics.dto';

@Controller('profile-statistics')
export class ProfileStatisticsController {
  constructor(
    private readonly getProfileStatisticsHandler: GetProfileStatisticsHandler,
  ) {}

  @Get()
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<{ success: true; data: ProfileStatisticsResponseDto }> {
    const statistics = await this.getProfileStatisticsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: statistics };
  }
}
