import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetAuditLogHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ auditLogId }: { auditLogId: string }) {
    return this.adminService.getAuditLogDetail(auditLogId);
  }
}
