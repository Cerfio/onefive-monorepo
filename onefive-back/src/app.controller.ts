import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { SkipWaitlistCheck } from './common/decorators/skip-waitlist-check.decorator';

@Controller()
@SkipWaitlistCheck()
export class AppController {
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
}
