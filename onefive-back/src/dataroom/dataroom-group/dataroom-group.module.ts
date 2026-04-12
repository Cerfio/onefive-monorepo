import { Module } from '@nestjs/common';
import { DataroomGroupController } from './controllers/dataroom-group.controller';
import { DataroomGroupService } from './services/dataroom-group.service';
import { MemberService } from '../services/member.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [DataroomGroupController],
  providers: [DataroomGroupService, MemberService, LoggerProvider],
  exports: [DataroomGroupService],
})
export class DataroomGroupModule {}
