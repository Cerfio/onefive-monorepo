import { Module, forwardRef } from '@nestjs/common';
import { DiscussionPollVoteService } from './discussion-poll-vote.service';
import { DiscussionPollVoteController } from './discussion-poll-vote.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CreateDiscussionPollVoteHandler } from './handlers/create-discussion-poll-vote.handler';
import { ProfileModule } from '../profile/profile.module';
import { DiscussionModule } from '../discussion/discussion.module';

@Module({
  imports: [ProfileModule, forwardRef(() => DiscussionModule)],
  controllers: [DiscussionPollVoteController],
  providers: [
    DiscussionPollVoteService,
    LoggerProvider,
    CreateDiscussionPollVoteHandler,
  ],
  exports: [DiscussionPollVoteService],
})
export class DiscussionPollVoteModule {}
