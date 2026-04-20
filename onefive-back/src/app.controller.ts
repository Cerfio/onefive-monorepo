import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { SkipWaitlistCheck } from './common/decorators/skip-waitlist-check.decorator';
import { PrismaService } from './prisma/prisma.service';

@Controller()
@SkipWaitlistCheck()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): { message: string } {
    return { message: "Bienvenue sur l'API OneFive Back" };
  }

  @Public()
  @Get('health')
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('health/deep')
  async getDeepHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    db: 'ok' | 'error';
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: 'ok',
      };
    } catch {
      throw new HttpException(
        {
          status: 'error',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          db: 'error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
