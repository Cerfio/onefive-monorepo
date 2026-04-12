import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminExportUsersHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute() {
    const users = await this.adminService.exportUsers();
    return this.toCsv(users);
  }

  private toCsv(
    users: Awaited<ReturnType<AdminService['exportUsers']>>,
  ): string {
    const header =
      'id,email,firstName,lastName,city,country,waitlistStatus,isEmailVerified,isBanned,createdAt';
    const rows = users.map((u) =>
      [
        u.id,
        u.email,
        u.profile?.firstName ?? '',
        u.profile?.lastName ?? '',
        u.profile?.city ?? '',
        u.profile?.countryCode ?? '',
        u.profile?.waitlistStatus ?? '',
        u.isEmailVerified,
        u.isBanned,
        u.createdAt,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
