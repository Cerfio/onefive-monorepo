import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { CreateSpotDto } from 'src/spotlight/dto/create-spot.dto';
import { SpotlightService } from 'src/spotlight/spotlight.service';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminCreateSpotlightHandler {
  constructor(
    private readonly spotlightService: SpotlightService,
    private readonly adminService: AdminService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    spotData,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    spotData: CreateSpotDto;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const spot = await this.spotlightService.create({
      transactionId,
      spotData,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.spotlight.create',
      resourceType: 'spotlight',
      resourceId: spot.id,
      metadata: {
        transactionId,
        spotType: spot.spot,
        name: spot.name,
        description: spot.description,
        highlight: spot.highlight,
        address: spot.address,
        url: spot.url,
        image: spot.image,
        provider: spot.provider,
      },
      ipAddress,
      userAgent,
    });

    return spot;
  }
}
