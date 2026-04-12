import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { PostService } from 'src/post/post.service';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminDeletePostHandler {
  constructor(
    private readonly postService: PostService,
    private readonly adminService: AdminService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    postId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    postId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const postInfo = await this.adminService.getPostForAudit(postId);

    await this.postService.delete({
      transactionId,
      where: { id: postId },
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.post.delete',
      resourceType: 'post',
      resourceId: postId,
      metadata: {
        transactionId,
        ...(postInfo && {
          authorProfileId: postInfo.profileId,
          contentPreview: postInfo.contentPreview,
        }),
      },
      ipAddress,
      userAgent,
    });
  }
}
