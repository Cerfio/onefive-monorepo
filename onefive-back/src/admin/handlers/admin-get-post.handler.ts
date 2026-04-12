import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetPostHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ postId }: { postId: string }) {
    return this.adminService.getPostDetail(postId);
  }
}
