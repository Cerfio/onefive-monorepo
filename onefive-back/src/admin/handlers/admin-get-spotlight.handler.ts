import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGetSpotlightHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({ spotId }: { spotId: string }) {
    return this.adminService.getSpotlight(spotId);
  }
}
