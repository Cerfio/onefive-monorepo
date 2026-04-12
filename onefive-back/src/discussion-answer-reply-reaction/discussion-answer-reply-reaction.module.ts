import { Module } from '@nestjs/common';
import { DiscussionAnswerReplyReactionController } from './discussion-answer-reply-reaction.controller';
import { DiscussionAnswerReplyReactionService } from './discussion-answer-reply-reaction.service';
import { CreateDiscussionAnswerReplyReactionHandler } from './handlers/create-discussion-answer-reply-reaction.handler';
import { DeleteDiscussionAnswerReplyReactionHandler } from './handlers/delete-discussion-answer-reply-reaction.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [DiscussionAnswerReplyReactionController],
  providers: [
    DiscussionAnswerReplyReactionService,
    CreateDiscussionAnswerReplyReactionHandler,
    DeleteDiscussionAnswerReplyReactionHandler,
    LoggerProvider,
  ],
  exports: [DiscussionAnswerReplyReactionService],
})
export class DiscussionAnswerReplyReactionModule {}
