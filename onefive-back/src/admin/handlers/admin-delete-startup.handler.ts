import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminDeleteStartupHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    startupId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    startupId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const startup = await this.adminService.deleteStartup(startupId);
    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.startup.delete',
      resourceType: 'startup',
      resourceId: startupId,
      metadata: {
        transactionId,
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        categories: startup.categories,
        countryCode: startup.countryCode,
        city: startup.city,
        website: startup.website,
        linkedin: startup.linkedin,
        logo: startup.logo,
        coverImage: startup.coverImage,
        teamSize: startup.teamSize,
        investorsCount: startup.investorsCount,
        partnersCount: startup.partnersCount,
      },
      ipAddress,
      userAgent,
    });
  }
}
