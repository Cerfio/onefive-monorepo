import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetStartupHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ startupId }: { startupId: string }) {
    return this.adminService.getStartupDetail(startupId);
  }
}
