import { Module } from '@nestjs/common';
import { DiscussionAnswerReactionController } from './discussion-answer-reaction.controller';
import { DiscussionAnswerReactionService } from './discussion-answer-reaction.service';
import { CreateDiscussionAnswerReactionHandler } from './handlers/create-discussion-answer-reaction.handler';
import { DeleteDiscussionAnswerReactionHandler } from './handlers/delete-discussion-answer-reaction.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [DiscussionAnswerReactionController],
  providers: [
    DiscussionAnswerReactionService,
    CreateDiscussionAnswerReactionHandler,
    DeleteDiscussionAnswerReactionHandler,
    LoggerProvider,
  ],
  exports: [DiscussionAnswerReactionService],
})
export class DiscussionAnswerReactionModule {}
