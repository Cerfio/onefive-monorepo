import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminListPostsHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    skip,
    take,
    search,
  }: {
    skip: number;
    take: number;
    search?: string;
  }) {
    return this.adminService.listPosts({ skip, take, search });
  }
}
