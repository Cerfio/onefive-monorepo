import { Body, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReportHandler } from './handlers/create-report.handler';

@Controller('reports')
export class ReportController {
  constructor(private readonly createReportHandler: CreateReportHandler) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CreateReportDto,
  ) {
    const result = await this.createReportHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      resourceType: body.resourceType,
      resourceId: body.resourceId,
      reason: body.reason,
      message: body.message,
    });
    return { success: true, data: result };
  }
}
