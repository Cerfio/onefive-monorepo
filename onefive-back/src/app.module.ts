import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerProvider } from './common/logger/logger.provider';
import { UsersModule } from './users/users.module';
import { SessionGuard } from './common/guards/session-guard/session.guard';
import { WaitlistGuard } from './common/guards/waitlist.guard';
import { OtpOnlySessionGuard } from './common/guards/otp-only-session.guard';
import { EmailVerifiedGuard } from './common/guards/email-verified.guard';
import { OnboardingCompleteGuard } from './common/guards/onboarding-complete.guard';
import { APP_GUARD } from '@nestjs/core';
import { SessionsModule } from './sessions/sessions.module';
import { StreakModule } from './streak/streak.module';
import { ProfileModule } from './profile/profile.module';
import { DiscussionModule } from './discussion/discussion.module';
import { DiscussionUpvoteModule } from './discussion-upvote/discussion-upvote.module';
import { DiscussionPollVoteModule } from './discussion-poll-vote/discussion-poll-vote.module';
import { DiscussionReactionModule } from './discussion-reaction/discussion-reaction.module';
import { DiscussionAnswerModule } from './discussion-answer/discussion-answer.module';
import { DiscussionAnswerUpvoteModule } from './discussion-answer-upvote/discussion-answer-upvote.module';
import { DiscussionAnswerReactionModule } from './discussion-answer-reaction/discussion-answer-reaction.module';
import { DiscussionAnswerReplyModule } from './discussion-answer-reply/discussion-answer-reply.module';
import { DiscussionAnswerReplyReactionModule } from './discussion-answer-reply-reaction/discussion-answer-reply-reaction.module';
import { DiscussionAnswerReplyUpvoteModule } from './discussion-answer-reply-upvote/discussion-answer-reply-upvote.module';
import { PostViewModule } from './post-view/post-view.module';
import { DiscussionViewModule } from './discussion-view/discussion-view.module';
import { LocationModule } from './location/location.module';
import { StorageModule } from './storage/storage.module';
import { SpotlightModule } from './spotlight/spotlight.module';
import { PostModule } from './post/post.module';
import { PostCommentModule } from './post-comment/post-comment.module';
import { PostReactionModule } from './post-reaction/post-reaction.module';
import { PostCommentReactionModule } from './post-comment-reaction/post-comment-reaction.module';
import { EmailModule } from './email/email.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { DataroomModule } from './dataroom/dataroom.module';
import { DataroomGroupModule } from './dataroom/dataroom-group/dataroom-group.module';
import { DataroomInvitationModule } from './dataroom/dataroom-invitation/dataroom-invitation.module';
import { DataroomGroupPermissionModule } from './dataroom/dataroom-group-permission/dataroom-group-permission.module';
import { DataroomCommentModule } from './dataroom-comment/dataroom-comment.module';
import { ProfileSuggestionModule } from './profile-suggestion/profile-suggestion.module';
import { StartupSuggestionModule } from './startup-suggestion/startup-suggestion.module';
import { ProfileStatisticsModule } from './profile-statistics/profile-statistics.module';
import { ProfileAnalyticsModule } from './profile-analytics/profile-analytics.module';
import { PostBookmarkModule } from './post-bookmark/post-bookmark.module';
import { ProfileRelationshipsModule } from './profile-relationships/profile-relationships.module';
import { StartupModule } from './startup/startup.module';
import { StartupInvitationModule } from './startup-invitation/startup-invitation.module';
import { FollowsModule } from './follows/follows.module';
import { NetworkModule } from './network/network.module';
import { AppController } from './app.controller';
import { ProfilePostModule } from './profile-post/profile-post.module';
import { ProfileAvatarModule } from './profile-avatar/profile-avatar.module';
import { ProfileCoverModule } from './profile-cover/profile-cover.module';
import { FileModule } from './file/file.module';
import { ExperienceModule } from './experience/experience.module';
import { EducationModule } from './education/education.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { ProfileFollowModule } from './profile-follow/profile-follow.module';
import { ProfileConnectionModule } from './profile-connection/profile-connection.module';
import { MessagingModule } from './messaging/messaging.module';
import { CrmModule } from './crm/crm.module';
import { NotificationModule } from './notification/notification.module';
import { ReferralModule } from './referral/referral.module';
import { LinkedInSyncModule } from './linkedin-sync/linkedin-sync.module';
import { SearchModule } from './search/search.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { FeedExtraModule } from './feed-extra/feed-extra.module';
import { AdminModule } from './admin/admin.module';
import { SeoModule } from './seo/seo.module';
import { DiscordModule } from './discord/discord.module';
import { ReportModule } from './report/report.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PostHogModule } from './posthog/posthog.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    PrismaModule,
    PostHogModule,

    // 🚨 Rate Limiting - Protection DDoS
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 seconde
          limit: process.env.SKIP_THROTTLE === 'true' ? 1000000 : 3, // Très élevé en test
        },
        {
          name: 'medium',
          ttl: 10000, // 10 secondes
          limit: process.env.SKIP_THROTTLE === 'true' ? 1000000 : 20, // Très élevé en test
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: process.env.SKIP_THROTTLE === 'true' ? 1000000 : 100, // Très élevé en test
        },
      ],
    }),

    AuthModule,
    UsersModule,
    SessionsModule,
    StreakModule,
    ProfileModule,
    PostModule,
    PostViewModule,
    DiscussionModule,
    DiscussionViewModule,
    DiscussionUpvoteModule,
    DiscussionPollVoteModule,
    DiscussionReactionModule,
    DiscussionAnswerModule,
    DiscussionAnswerUpvoteModule,
    DiscussionAnswerReactionModule,
    DiscussionAnswerReplyModule,
    DiscussionAnswerReplyReactionModule,
    DiscussionAnswerReplyUpvoteModule,
    LocationModule,
    StorageModule,
    SpotlightModule,
    PostCommentModule,
    PostReactionModule,
    PostCommentReactionModule,
    EmailModule,
    EmailVerificationModule,
    DataroomModule,
    DataroomGroupModule,
    DataroomInvitationModule,
    DataroomGroupPermissionModule,
    DataroomCommentModule,
    ProfileSuggestionModule,
    StartupSuggestionModule,
    ProfileStatisticsModule,
    ProfileAnalyticsModule,
    PostBookmarkModule,
    ProfileRelationshipsModule,
    StartupModule,
    StartupInvitationModule,
    FollowsModule,
    NetworkModule,
    ProfilePostModule,
    ProfileAvatarModule,
    ProfileCoverModule,
    FileModule,
    ExperienceModule,
    EducationModule,
    UserSettingsModule,
    ProfileFollowModule,
    ProfileConnectionModule,
    // Realtime messaging is delivered via SSE (MessagingEventsService), not
    // WebSocket. Cascading tests (notifyNewMessage, read receipts) push into
    // in-memory streams and tolerate the absence of connected SSE clients.
    MessagingModule,
    CrmModule,
    NotificationModule,
    ReferralModule,
    LinkedInSyncModule,
    SearchModule,
    FeedExtraModule,
    WaitlistModule,
    AdminModule,
    NewsletterModule,
    SeoModule,
    DiscordModule,
    ReportModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    LoggerProvider,
    // Désactiver le ThrottlerGuard en test pour éviter les rate limits
    ...(process.env.SKIP_THROTTLE === 'true'
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]),
    {
      provide: APP_GUARD,
      useClass: SessionGuard, // ✅ Authentification globale
    },
    {
      provide: APP_GUARD,
      useClass: OtpOnlySessionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EmailVerifiedGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OnboardingCompleteGuard,
    },
    {
      provide: APP_GUARD,
      useClass: WaitlistGuard,
    },
  ],
})
export class AppModule {}
