import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { DiscussionService } from 'src/discussion/discussion.service';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminDeleteDiscussionHandler {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly adminService: AdminService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    discussionId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    discussionId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const discussionInfo =
      await this.adminService.getDiscussionForAudit(discussionId);

    await this.discussionService.delete({
      transactionId,
      where: { id: discussionId },
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.discussion.delete',
      resourceType: 'discussion',
      resourceId: discussionId,
      metadata: {
        transactionId,
        ...(discussionInfo && {
          authorProfileId: discussionInfo.profileId,
          questionPreview: discussionInfo.questionPreview,
        }),
      },
      ipAddress,
      userAgent,
    });
  }
}
