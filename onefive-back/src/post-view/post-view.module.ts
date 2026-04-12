import { Module } from '@nestjs/common';
import { PostViewService } from './post-view.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PostViewService, LoggerProvider],
  exports: [PostViewService],
})
export class PostViewModule {}
