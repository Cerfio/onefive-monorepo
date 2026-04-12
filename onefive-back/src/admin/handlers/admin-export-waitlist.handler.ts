import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminExportWaitlistHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute() {
    const entries = await this.adminService.exportWaitlist();
    return this.toCsv(entries);
  }

  private toCsv(entries: Awaited<ReturnType<AdminService['exportWaitlist']>>): string {
    const header = 'id,firstName,lastName,email,createdAt';
    const rows = entries.map((e) =>
      [e.id, e.firstName, e.lastName, e.user.email, e.createdAt]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
