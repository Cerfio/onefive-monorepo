import { Module } from '@nestjs/common';
import { DiscussionAnswerUpvoteService } from './discussion-answer-upvote.service';
import { DiscussionAnswerUpvoteController } from './discussion-answer-upvote.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CreateDiscussionAnswerUpvoteHandler } from './handlers/create-discussion-answer-upvote.handler';
import { DeleteDiscussionAnswerUpvoteHandler } from './handlers/delete-discussion-answer-upvote.handler';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [DiscussionAnswerUpvoteController],
  providers: [
    DiscussionAnswerUpvoteService,

    LoggerProvider,
    CreateDiscussionAnswerUpvoteHandler,
    DeleteDiscussionAnswerUpvoteHandler,
  ],
  exports: [DiscussionAnswerUpvoteService],
})
export class DiscussionAnswerUpvoteModule {}
