import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { WaitlistService } from 'src/waitlist/waitlist.service';
import { AdminService } from '../admin.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class AdminBulkAcceptWaitlistHandler {
  constructor(
    private readonly waitlistService: WaitlistService,
    private readonly adminService: AdminService,
    private readonly posthogService: PostHogService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    count,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    count: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ accepted: number }> {
    const { acceptedIds, acceptedProfiles } =
      await this.adminService.bulkAcceptWaitlist(count);

    for (const profileId of acceptedIds) {
      await this.waitlistService.activateProfile(profileId);
      this.posthogService.capture(profileId, 'waitlist_activated_by_admin', {
        activated_by: 'admin',
        bulk: true,
      });
    }

    const metadata = {
      transactionId,
      requestedCount: count,
      acceptedCount: acceptedIds.length,
      acceptedProfileIds: acceptedIds,
      acceptedProfiles,
    };

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.waitlist.bulk-accept',
      resourceType: 'profile',
      metadata,
      ipAddress,
      userAgent,
    });

    this.logger.info('admin.waitlist.bulk-accept', {
      actorAdminUserId,
      ...metadata,
    });

    return { accepted: acceptedIds.length };
  }
}
