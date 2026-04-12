import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminHideDiscussionHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    discussionId,
    isHidden,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    discussionId: string;
    isHidden: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const discussionInfo =
      await this.adminService.getDiscussionForAudit(discussionId);
    const result = await this.adminService.hideDiscussion(discussionId, isHidden);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isHidden ? 'admin.discussion.hide' : 'admin.discussion.unhide',
      resourceType: 'discussion',
      resourceId: discussionId,
      metadata: {
        transactionId,
        previousIsHidden: discussionInfo?.isHidden,
        isHidden,
        ...(discussionInfo && {
          authorProfileId: discussionInfo.profileId,
          questionPreview: discussionInfo.questionPreview,
        }),
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
