import { Module } from '@nestjs/common';
import { DiscussionUpvoteService } from './discussion-upvote.service';
import { DiscussionUpvoteController } from './discussion-upvote.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { DeleteDiscussionUpvoteHandler } from './handlers/delete-discussion-upvote.handler';
import { CreateDiscussionUpvoteHandler } from './handlers/create-discussion-upvote.handler';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [DiscussionUpvoteController],
  providers: [
    DiscussionUpvoteService,

    LoggerProvider,
    DeleteDiscussionUpvoteHandler,
    CreateDiscussionUpvoteHandler,
  ],
  exports: [DiscussionUpvoteService],
})
export class DiscussionUpvoteModule {}
