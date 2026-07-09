import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { PostDraftController } from './post-draft.controller';
import { PostDraftService } from './post-draft.service';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [PostDraftController],
  providers: [PostDraftService, LoggerProvider],
})
export class PostDraftModule {}
