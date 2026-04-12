import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminListRolesHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute() {
    return this.adminService.listRoles();
  }
}
