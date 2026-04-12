import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetDiscussionHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ discussionId }: { discussionId: string }) {
    return this.adminService.getDiscussionDetail(discussionId);
  }
}
