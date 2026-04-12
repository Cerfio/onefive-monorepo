import { Module } from '@nestjs/common';
import { DataroomCommentController } from './controllers/dataroom-comment.controller';
import { DataroomCommentHandler } from './handlers/dataroom-comment.handler';
import { DataroomCommentService } from './services/dataroom-comment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { DataroomMemberGuard } from '../dataroom/guards/dataroom-member.guard';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [DataroomCommentController],
  providers: [
    DataroomCommentHandler,
    DataroomCommentService,
    DataroomMemberGuard,
    LoggerProvider,
  ],
  exports: [DataroomCommentService],
})
export class DataroomCommentModule {}
