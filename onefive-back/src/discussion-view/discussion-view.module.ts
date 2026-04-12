import { Module } from '@nestjs/common';
import { DiscussionViewService } from './discussion-view.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [DiscussionViewService, LoggerProvider],
  exports: [DiscussionViewService],
})
export class DiscussionViewModule {}
