import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { SpotlightService } from '../spotlight.service';
import { Spot } from '@prisma/client';

export interface ListSpotlightInput {
  transactionId: string;
  lat: number;
  lng: number;
  spot?: string;
  provider?: string;
  cost?: string;
  expertiseDomains?: string;
  beginDate?: string;
  endDate?: string;
  take?: number;
  skip?: number;
  radius?: number;
}

function parseCsvQueryParam(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// Helper function to convert GeoJSON location to {lat, lng} format
function transformLocation(location: any): { lat: number; lng: number } | null {
  if (!location) return null;

  // If it's already in {lat, lng} format
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return { lat: location.lat, lng: location.lng };
  }

  // If it's in GeoJSON format {type: 'Point', coordinates: [lng, lat]}
  if (
    location.type === 'Point' &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length >= 2
  ) {
    return { lat: location.coordinates[1], lng: location.coordinates[0] };
  }

  return null;
}

@Injectable()
export class ListSpotlightHandler {
  constructor(
    private readonly spotlightService: SpotlightService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    lat,
    lng,
    spot,
    provider,
    cost,
    expertiseDomains,
    beginDate,
    endDate,
    take,
    skip,
    radius,
  }: ListSpotlightInput) {
    try {
      const result = await this.spotlightService.list({
        transactionId,
        lat,
        lng,
        radius,
        take,
        skip,
        provider: parseCsvQueryParam(provider),
        expertiseDomains: parseCsvQueryParam(expertiseDomains),
        cost: parseCsvQueryParam(cost),
        spot: parseCsvQueryParam(spot),
        beginDate,
        endDate,
      });

      const payload = result.spots.map((spot: any) => ({
        id: spot.id,
        createdAt: spot.createdAt,
        url: spot.url || null,
        spot: spot.spot,
        name: spot.name,
        highlight: spot.highlight || null,
        address: spot.address || null,
        image: spot.image || null,
        location: transformLocation(spot.location),
        provider: spot.provider,
        accelerator: spot.accelerator || null,
        contest: spot.contest || null,
        event: spot.event
          ? {
              ...spot.event,
              prices: (spot.event.prices ?? []).map((eventPrice: any) => ({
                name: eventPrice.plan.name,
                price: eventPrice.plan.price,
                currency: eventPrice.plan.currency,
                fee: eventPrice.plan.fee,
              })),
            }
          : null,
        incubator: spot.incubator || null,
        coworkingSpace: spot.coworkingSpace || null,
      }));

      return {
        payload,
        count: result.count,
      };
    } catch (error) {
      this.logger.error('List spotlight failed', {
        transactionId,
        lat,
        lng,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
