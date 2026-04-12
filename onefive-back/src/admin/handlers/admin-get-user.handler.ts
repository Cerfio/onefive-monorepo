import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetUserHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ userId }: { userId: string }) {
    return this.adminService.getUserDetail(userId);
  }
}
