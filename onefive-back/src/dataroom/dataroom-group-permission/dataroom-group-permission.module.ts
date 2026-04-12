import { Module } from '@nestjs/common';
import { DataroomGroupPermissionController } from './controllers/dataroom-group-permission.controller';
import { DataroomGroupPermissionService } from './services/dataroom-group-permission.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [DataroomGroupPermissionController],
  providers: [DataroomGroupPermissionService, LoggerProvider],
  exports: [DataroomGroupPermissionService],
})
export class DataroomGroupPermissionModule {}
