import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { SpotlightService } from 'src/spotlight/spotlight.service';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminDeleteSpotlightHandler {
  constructor(
    private readonly spotlightService: SpotlightService,
    private readonly adminService: AdminService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    spotId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    spotId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const spotInfo = await this.adminService.getSpotForAudit(spotId);
    await this.spotlightService.delete(spotId, transactionId);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.spotlight.delete',
      resourceType: 'spotlight',
      resourceId: spotId,
      metadata: {
        transactionId,
        ...(spotInfo && {
          spotType: spotInfo.spotType,
          name: spotInfo.name,
          description: spotInfo.description,
          highlight: spotInfo.highlight,
          address: spotInfo.address,
          url: spotInfo.url,
          image: spotInfo.image,
          provider: spotInfo.provider,
        }),
      },
      ipAddress,
      userAgent,
    });
  }
}
