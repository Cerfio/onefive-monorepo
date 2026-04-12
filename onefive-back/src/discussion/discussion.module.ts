import { Module, forwardRef } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionController } from './discussion.controller';
import { LoggerProvider } from '../common/logger/logger.provider';
import { CreateDiscussionHandler } from './handlers/create-discussion.handler';
import { ListDiscussionHandler } from './handlers/list-discussion.handler';
import { GetDiscussionHandler } from './handlers/get-discussion.handler';
import { DiscussionViewModule } from '../discussion-view/discussion-view.module';
import { UpdateDiscussionHandler } from './handlers/update-discussion.handler';
import { DeleteDiscussionHandler } from './handlers/delete-discussion.handler';
import { ProfileModule } from '../profile/profile.module';
import { StorageModule } from 'src/storage/storage.module';
import { ProfileFollowModule } from '../profile-follow/profile-follow.module';
import { DiscussionPollVoteModule } from '../discussion-poll-vote/discussion-poll-vote.module';
import { StreakModule } from '../streak/streak.module';

@Module({
  imports: [
    DiscussionViewModule,
    ProfileModule,
    StorageModule,
    ProfileFollowModule,
    StreakModule,
    forwardRef(() => DiscussionPollVoteModule),
  ],
  controllers: [DiscussionController],
  providers: [
    DiscussionService,

    LoggerProvider,
    CreateDiscussionHandler,
    ListDiscussionHandler,
    GetDiscussionHandler,
    UpdateDiscussionHandler,
    DeleteDiscussionHandler,
  ],
  exports: [DiscussionService],
})
export class DiscussionModule {}
