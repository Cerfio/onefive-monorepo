import { Module } from '@nestjs/common';
import { DiscussionAnswerReplyUpvoteController } from './discussion-answer-reply-upvote.controller';
import { DiscussionAnswerReplyUpvoteService } from './discussion-answer-reply-upvote.service';
import { CreateDiscussionAnswerReplyUpvoteHandler } from './handlers/create-discussion-answer-reply-upvote.handler';
import { DeleteDiscussionAnswerReplyUpvoteHandler } from './handlers/delete-discussion-answer-reply-upvote.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [DiscussionAnswerReplyUpvoteController],
  providers: [
    DiscussionAnswerReplyUpvoteService,
    CreateDiscussionAnswerReplyUpvoteHandler,
    DeleteDiscussionAnswerReplyUpvoteHandler,
    LoggerProvider,
  ],
  exports: [DiscussionAnswerReplyUpvoteService],
})
export class DiscussionAnswerReplyUpvoteModule {}
