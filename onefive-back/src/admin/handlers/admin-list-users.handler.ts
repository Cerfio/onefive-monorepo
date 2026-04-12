import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminListUsersHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    skip,
    take,
    search,
    dateFrom,
    dateTo,
  }: {
    skip: number;
    take: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.adminService.listUsers({ skip, take, search, dateFrom, dateTo });
  }
}
