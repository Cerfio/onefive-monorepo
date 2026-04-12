import { Module } from '@nestjs/common';
import { DiscussionReactionService } from './discussion-reaction.service';
import { DiscussionReactionController } from './discussion-reaction.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CreateDiscussionReactionHandler } from './handlers/create-discussion-reaction.handler';
import { DeleteDiscussionReactionHandler } from './handlers/delete-discussion-reaction.handler';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [DiscussionReactionController],
  providers: [
    DiscussionReactionService,

    LoggerProvider,
    CreateDiscussionReactionHandler,
    DeleteDiscussionReactionHandler,
  ],
  exports: [DiscussionReactionService],
})
export class DiscussionReactionModule {}
