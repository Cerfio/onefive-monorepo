import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminListDataroomsHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ skip, take }: { skip: number; take: number }) {
    return this.adminService.listDatarooms({ skip, take });
  }
}
