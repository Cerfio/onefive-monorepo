import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Log } from 'src/common/logger/logger.decorator';
import { CreateSpotDto } from 'src/spotlight/dto/create-spot.dto';
import { SpotlightService } from 'src/spotlight/spotlight.service';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminUpdateSpotlightHandler {
  constructor(
    private readonly spotlightService: SpotlightService,
    private readonly adminService: AdminService,
  ) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    spotId,
    spotData,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    spotId: string;
    spotData: Partial<CreateSpotDto>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const beforeSpot = await this.adminService.getSpotlight(spotId);
    const spot = await this.spotlightService.update(spotId, {
      transactionId,
      spotData,
    });
    const afterSpot = await this.adminService.getSpotlight(spot.id);

    const trackedKeys = Object.keys(spotData) as Array<keyof CreateSpotDto>;
    const changes = trackedKeys.reduce<
      Record<string, { before: unknown; after: unknown }>
    >((acc, key) => {
      const beforeValue = (beforeSpot as Record<string, unknown>)[
        key as string
      ];
      const afterValue = (afterSpot as Record<string, unknown>)[key as string];
      if (
        JSON.stringify(beforeValue ?? null) !==
        JSON.stringify(afterValue ?? null)
      ) {
        acc[key as string] = {
          before: beforeValue ?? null,
          after: afterValue ?? null,
        };
      }
      return acc;
    }, {});
    const changedFields = Object.keys(changes);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.spotlight.update',
      resourceType: 'spotlight',
      resourceId: spot.id,
      metadata: {
        transactionId,
        spotType: spot.spot,
        changedFields,
        changes: JSON.parse(JSON.stringify(changes)) as Prisma.InputJsonValue,
      },
      ipAddress,
      userAgent,
    });

    return spot;
  }
}
