import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { WaitlistService } from 'src/waitlist/waitlist.service';
import { AdminService } from '../admin.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class AdminAcceptWaitlistHandler {
  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly adminService: AdminService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    profileId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    profileId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const profileInfo =
      await this.adminService.getProfileWithUserForAudit(profileId);

    await this.waitlistService.activateProfile(profileId);
    this.posthogService.capture(profileId, 'waitlist_activated_by_admin', {
      activated_by: 'admin',
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.waitlist.accept',
      resourceType: 'profile',
      resourceId: profileId,
      metadata: {
        transactionId,
        ...(profileInfo && {
          profileId,
          userId: profileInfo.userId,
          email: profileInfo.email,
          firstName: profileInfo.firstName,
          lastName: profileInfo.lastName,
        }),
      },
      ipAddress,
      userAgent,
    });
  }
}
