import { Module } from '@nestjs/common';
import { DiscussionAnswerService } from './discussion-answer.service';
import { DiscussionAnswerController } from './discussion-answer.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CreateDiscussionAnswerHandler } from './handlers/create-discussion-answer.handler';
import { UpdateDiscussionAnswerHandler } from './handlers/update-discussion-answer.handler';
import { DeleteDiscussionAnswerHandler } from './handlers/delete-discussion-answer.handler';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [DiscussionAnswerController],
  providers: [
    DiscussionAnswerService,

    LoggerProvider,
    CreateDiscussionAnswerHandler,
    UpdateDiscussionAnswerHandler,
    DeleteDiscussionAnswerHandler,
  ],
  exports: [DiscussionAnswerService],
})
export class DiscussionAnswerModule {}
