import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminExportAuditLogsHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute() {
    const logs = await this.adminService.exportAuditLogs();
    return this.toCsv(logs);
  }

  private toCsv(logs: Awaited<ReturnType<AdminService['exportAuditLogs']>>): string {
    const header =
      'id,action,resourceType,resourceId,adminEmail,adminName,ipAddress,userAgent,metadata,createdAt';
    const rows = logs.map((l) => {
      const metadataStr =
        l.metadata != null ? JSON.stringify(l.metadata).replace(/"/g, '""') : '';
      return [
        l.id,
        l.action,
        l.resourceType,
        l.resourceId ?? '',
        l.adminUser?.email ?? '',
        `${l.adminUser?.firstName ?? ''} ${l.adminUser?.lastName ?? ''}`.trim(),
        l.ipAddress ?? '',
        l.userAgent ?? '',
        metadataStr,
        l.createdAt,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });
    return [header, ...rows].join('\n');
  }
}
