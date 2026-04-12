import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminHidePostHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    postId,
    isHidden,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    postId: string;
    isHidden: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const postInfo = await this.adminService.getPostForAudit(postId);
    const result = await this.adminService.hidePost(postId, isHidden);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isHidden ? 'admin.post.hide' : 'admin.post.unhide',
      resourceType: 'post',
      resourceId: postId,
      metadata: {
        transactionId,
        previousIsHidden: postInfo?.isHidden,
        isHidden,
        ...(postInfo && {
          authorProfileId: postInfo.profileId,
          contentPreview: postInfo.contentPreview,
        }),
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
