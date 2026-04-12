import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminListAuditLogsHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    skip,
    take,
    search,
    resourceType,
  }: {
    skip: number;
    take: number;
    search?: string;
    resourceType?: string;
  }) {
    return this.adminService.listAuditLogs({ skip, take, search, resourceType });
  }
}
