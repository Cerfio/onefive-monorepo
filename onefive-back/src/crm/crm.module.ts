import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [CrmController],
  providers: [CrmService, LoggerProvider],
})
export class CrmModule {}
