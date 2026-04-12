import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { ProfileModule } from '../profile/profile.module';
import { DiscussionAnswerReplyController } from './discussion-answer-reply.controller';
import { CreateDiscussionAnswerReplyHandler } from './handlers/create-discussion-answer-reply.handler';
import { UpdateDiscussionAnswerReplyHandler } from './handlers/update-discussion-answer-reply.handler';
import { DeleteDiscussionAnswerReplyHandler } from './handlers/delete-discussion-answer-reply.handler';

@Module({
  imports: [ProfileModule],
  controllers: [DiscussionAnswerReplyController],
  providers: [
    LoggerProvider,
    PrismaService,
    CreateDiscussionAnswerReplyHandler,
    UpdateDiscussionAnswerReplyHandler,
    DeleteDiscussionAnswerReplyHandler,
  ],
  exports: [],
})
export class DiscussionAnswerReplyModule {}
