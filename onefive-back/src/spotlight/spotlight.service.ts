import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  SpotlightCreateException,
  SpotlightListException,
  SpotlightUpdateException,
  SpotlightDeleteException,
} from './spotlight.exception';
import { Prisma, Spot, SpotType, ProviderType } from '@prisma/client';

export interface CreateSpotInput {
  transactionId: string;
  spotData: any;
}

export interface ListSpotsInput {
  transactionId: string;
  lat?: number;
  lng?: number;
  radius?: number;
  take?: number;
  skip?: number;
  spot?: string[];
  provider?: string[];
  cost?: string[];
  expertiseDomains?: string[];
  beginDate?: string;
  endDate?: string;
}

export interface UpdateSpotInput {
  transactionId: string;
  spotData: Partial<any>;
}

@Injectable()
export class SpotlightService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({ transactionId, spotData }: CreateSpotInput): Promise<Spot> {
    try {
      // Convertir les données pour PostgreSQL
      const spotCreateData: any = {
        url: spotData.url,
        spot: spotData.spot,
        name: spotData.name,
        highlight: spotData.highlight,
        address: spotData.address,
        image: spotData.image,
        location: spotData.location
          ? {
              type: 'Point',
              coordinates: [spotData.location.lng, spotData.location.lat],
            }
          : null,
        provider: spotData.provider,
        description: spotData.description,
        raw: spotData.raw || null,
      };

      // Transform DTO price items into Prisma nested-create format.
      // Incubator/Accelerator/Coworking prices: { periodicity, plan: { name, price, ... } }
      //   → { periodicity, plan: { create: { name, price, ... } } }
      // Event/Contest prices: { name, price, currency, fee }
      //   → { plan: { create: { name, price, currency, fee } } }
      const transformPriceItems = (
        items: any[],
        hasPeriodicityField: boolean,
      ) => {
        if (!items || items.length === 0) return [];
        return items.map((item: any) => {
          if (hasPeriodicityField) {
            const { plan, ...rest } = item;
            return { ...rest, plan: { create: plan } };
          }
          return { plan: { create: item } };
        });
      };

      const prepareRelation = (data: any, hasPeriodicity: boolean) => {
        if (!data) return data;
        const { prices, ...rest } = data;
        if (prices === undefined) return rest;
        return {
          ...rest,
          prices: { create: transformPriceItems(prices, hasPeriodicity) },
        };
      };

      if (spotData.accelerator) {
        spotCreateData.accelerator = {
          create: prepareRelation(spotData.accelerator, true),
        };
      }
      if (spotData.contest) {
        spotCreateData.contest = {
          create: prepareRelation(spotData.contest, false),
        };
      }
      if (spotData.event) {
        spotCreateData.event = {
          create: prepareRelation(spotData.event, false),
        };
      }
      if (spotData.incubator) {
        spotCreateData.incubator = {
          create: prepareRelation(spotData.incubator, true),
        };
      }
      if (spotData.coworkingSpace) {
        const { prices, openingHours, ...cwRest } = spotData.coworkingSpace;
        const pricesPart =
          prices !== undefined
            ? { prices: { create: transformPriceItems(prices, true) } }
            : {};
        const ohPart = openingHours
          ? { openingHours: { create: openingHours } }
          : {};
        spotCreateData.coworkingSpace = {
          create: { ...cwRest, ...pricesPart, ...ohPart },
        };
      }

      // Pour les événements, vérifier s'il existe déjà
      if (spotData.spot === SpotType.EVENT && spotData.event?.uniqueId) {
        const existingSpot = await this.prisma.spot.findFirst({
          where: {
            spot: SpotType.EVENT,
            event: {
              uniqueId: spotData.event.uniqueId,
            },
          },
        });

        if (existingSpot) {
          const updatePayload: any = { ...spotCreateData };
          if (updatePayload.event?.create) {
            const { prices, ...eventFields } = updatePayload.event.create;
            updatePayload.event = {
              update: {
                ...eventFields,
                ...(prices
                  ? { prices: { deleteMany: {}, create: prices.create ?? [] } }
                  : {}),
              },
            };
          }
          return await this.prisma.spot.update({
            where: { id: existingSpot.id },
            data: updatePayload,
          });
        }
      }

      return await this.prisma.spot.create({
        data: spotCreateData,
      });
    } catch (error) {
      SpotlightCreateException.throw(this.logger, {
        transactionId,
        spotData,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async list({
    transactionId,
    lat,
    lng,
    radius,
    take = 10,
    skip = 0,
    spot = [],
    provider = [],
    cost = [],
    expertiseDomains = [],
    beginDate,
    endDate,
  }: ListSpotsInput) {
    try {
      const where: Prisma.SpotWhereInput = {};
      const andFilters: Prisma.SpotWhereInput[] = [];

      if (spot.length > 0) {
        where.spot = { in: spot as SpotType[] };
      }

      if (provider.length > 0) {
        where.provider = { in: provider as ProviderType[] };
      }

      if (expertiseDomains.length > 0) {
        andFilters.push({
          OR: [
            {
              event: {
                is: {
                  expertiseDomains: { hasSome: expertiseDomains as any[] },
                },
              },
            },
            {
              contest: {
                is: {
                  expertiseDomains: { hasSome: expertiseDomains as any[] },
                },
              },
            },
            {
              incubator: {
                is: {
                  expertiseDomains: { hasSome: expertiseDomains as any[] },
                },
              },
            },
            {
              accelerator: {
                is: {
                  expertiseDomains: { hasSome: expertiseDomains as any[] },
                },
              },
            },
          ],
        });
      }

      if (cost.length > 0) {
        const pricingPredicates: Prisma.SpotWhereInput[] = [];

        if (cost.includes('free')) {
          pricingPredicates.push({
            OR: [
              {
                event: {
                  is: { prices: { some: { plan: { price: { lte: 0 } } } } },
                },
              },
              {
                contest: {
                  is: { prices: { some: { plan: { price: { lte: 0 } } } } },
                },
              },
              {
                incubator: {
                  is: { prices: { some: { plan: { price: { lte: 0 } } } } },
                },
              },
              {
                accelerator: {
                  is: { prices: { some: { plan: { price: { lte: 0 } } } } },
                },
              },
              {
                coworkingSpace: {
                  is: { prices: { some: { plan: { price: { lte: 0 } } } } },
                },
              },
            ],
          });
        }

        if (cost.includes('paid')) {
          pricingPredicates.push({
            OR: [
              {
                event: {
                  is: { prices: { some: { plan: { price: { gt: 0 } } } } },
                },
              },
              {
                contest: {
                  is: { prices: { some: { plan: { price: { gt: 0 } } } } },
                },
              },
              {
                incubator: {
                  is: { prices: { some: { plan: { price: { gt: 0 } } } } },
                },
              },
              {
                accelerator: {
                  is: { prices: { some: { plan: { price: { gt: 0 } } } } },
                },
              },
              {
                coworkingSpace: {
                  is: { prices: { some: { plan: { price: { gt: 0 } } } } },
                },
              },
            ],
          });
        }

        if (cost.includes('donation')) {
          pricingPredicates.push({
            OR: [
              {
                event: {
                  is: {
                    prices: {
                      some: {
                        plan: {
                          name: { contains: 'donation', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
              {
                contest: {
                  is: {
                    prices: {
                      some: {
                        plan: {
                          name: { contains: 'donation', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
              {
                incubator: {
                  is: {
                    prices: {
                      some: {
                        plan: {
                          name: { contains: 'donation', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
              {
                accelerator: {
                  is: {
                    prices: {
                      some: {
                        plan: {
                          name: { contains: 'donation', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
              {
                coworkingSpace: {
                  is: {
                    prices: {
                      some: {
                        plan: {
                          name: { contains: 'donation', mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
            ],
          });
        }

        if (pricingPredicates.length > 0) {
          andFilters.push({ OR: pricingPredicates });
        }
      }

      if (beginDate || endDate) {
        const begin = beginDate ? new Date(beginDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const eventWindow: Prisma.SpotWhereInput = {
          event: {
            is: {
              ...(end ? { beginDate: { lte: end } } : {}),
              ...(begin ? { endDate: { gte: begin } } : {}),
            },
          },
        };

        const contestWindow: Prisma.SpotWhereInput = {
          contest: {
            is: {
              ...(end ? { beginDate: { lte: end } } : {}),
              ...(begin ? { endDate: { gte: begin } } : {}),
            },
          },
        };

        andFilters.push({ OR: [eventWindow, contestWindow] });
      }

      if (andFilters.length > 0) {
        where.AND = andFilters;
      }

      const includeRelations = {
        accelerator: true,
        contest: true,
        event: true,
        incubator: true,
        coworkingSpace: {
          include: {
            openingHours: true,
          },
        },
      };

      if (typeof lat === 'number' && typeof lng === 'number') {
        // Rayon de recherche en mètres, piloté par le filtre distance du front
        // (défaut 4 km si absent, borné à [100 m, 200 km] par sécurité).
        const radiusMeters = Math.min(Math.max(radius ?? 4000, 100), 200000);
        const nearbySpots = await this.prisma.$queryRaw<
          Array<{ id: string }>
        >(Prisma.sql`
          SELECT id FROM spots
          WHERE location IS NOT NULL
            AND ST_DWithin(
              ST_GeomFromGeoJSON(location::jsonb)::geography,
              ST_Point(${lng}, ${lat})::geography,
              ${radiusMeters}
            )
          ORDER BY ST_Distance(
            ST_GeomFromGeoJSON(location::jsonb)::geography,
            ST_Point(${lng}, ${lat})::geography
          ) ASC
        `);

        const nearbyIds = nearbySpots.map((item) => item.id);
        if (nearbyIds.length === 0) {
          return { spots: [], count: 0 };
        }

        const spotsWithRelations = await this.prisma.spot.findMany({
          where: {
            ...where,
            id: { in: nearbyIds },
          },
          include: includeRelations,
        });

        const spotsById = new Map(
          spotsWithRelations.map((spotItem) => [spotItem.id, spotItem]),
        );
        const orderedFilteredSpots = nearbyIds
          .map((id) => spotsById.get(id))
          .filter((spotItem): spotItem is NonNullable<typeof spotItem> =>
            Boolean(spotItem),
          );

        return {
          spots: orderedFilteredSpots.slice(skip, skip + take),
          count: orderedFilteredSpots.length,
        };
      }

      const spots = await this.prisma.spot.findMany({
        where,
        take,
        skip,
        include: includeRelations,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const count = await this.prisma.spot.count({ where });

      return { spots, count };
    } catch (error) {
      SpotlightListException.throw(this.logger, {
        transactionId,
        lat,
        lng,
        take,
        skip,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async update(
    id: string,
    { transactionId, spotData }: UpdateSpotInput,
  ): Promise<Spot> {
    try {
      // Convertir les données pour PostgreSQL
      const updateData: any = {};

      if (spotData.url !== undefined) updateData.url = spotData.url;
      if (spotData.spot !== undefined) updateData.spot = spotData.spot;
      if (spotData.name !== undefined) updateData.name = spotData.name;
      if (spotData.highlight !== undefined)
        updateData.highlight = spotData.highlight;
      if (spotData.address !== undefined) updateData.address = spotData.address;
      if (spotData.image !== undefined) updateData.image = spotData.image;
      if (spotData.provider !== undefined)
        updateData.provider = spotData.provider;
      if (spotData.description !== undefined)
        updateData.description = spotData.description;
      if (spotData.raw !== undefined) updateData.raw = spotData.raw;

      if (spotData.location) {
        updateData.location = {
          type: 'Point',
          coordinates: [spotData.location.lng, spotData.location.lat],
        };
      }

      // Same price-item transformation as create
      const transformUpdatePriceItems = (
        items: any[],
        hasPeriodicity: boolean,
      ) => {
        if (!items || items.length === 0) return [];
        return items.map((item: any) => {
          if (hasPeriodicity) {
            const { plan, ...rest } = item;
            return { ...rest, plan: { create: plan } };
          }
          return { plan: { create: item } };
        });
      };

      // Prisma upsert: `create` branch uses { create: [] } for nested many-relations,
      // `update` branch uses { deleteMany: {}, create: [] } to replace all existing.
      const buildRelationUpsert = (data: any, hasPeriodicity: boolean) => {
        const { prices, ...fields } = data;
        const transformed =
          prices !== undefined
            ? transformUpdatePriceItems(prices, hasPeriodicity)
            : undefined;
        return {
          create: {
            ...fields,
            ...(transformed !== undefined
              ? { prices: { create: transformed } }
              : {}),
          },
          update: {
            ...fields,
            ...(transformed !== undefined
              ? { prices: { deleteMany: {}, create: transformed } }
              : {}),
          },
        };
      };

      if (spotData.accelerator !== undefined) {
        updateData.accelerator = {
          upsert: buildRelationUpsert(spotData.accelerator, true),
        };
      }
      if (spotData.contest !== undefined) {
        updateData.contest = {
          upsert: buildRelationUpsert(spotData.contest, false),
        };
      }
      if (spotData.event !== undefined) {
        updateData.event = {
          upsert: buildRelationUpsert(spotData.event, false),
        };
      }
      if (spotData.incubator !== undefined) {
        updateData.incubator = {
          upsert: buildRelationUpsert(spotData.incubator, true),
        };
      }
      if (spotData.coworkingSpace !== undefined) {
        const { prices, openingHours, ...cwFields } = spotData.coworkingSpace;
        const transformed =
          prices !== undefined
            ? transformUpdatePriceItems(prices, true)
            : undefined;
        const pricesForCreate =
          transformed !== undefined ? { prices: { create: transformed } } : {};
        const pricesForUpdate =
          transformed !== undefined
            ? { prices: { deleteMany: {}, create: transformed } }
            : {};
        const ohForCreate = openingHours
          ? { openingHours: { create: openingHours } }
          : {};
        const ohForUpdate = openingHours
          ? {
              openingHours: {
                upsert: { create: openingHours, update: openingHours },
              },
            }
          : {};
        updateData.coworkingSpace = {
          upsert: {
            create: { ...cwFields, ...pricesForCreate, ...ohForCreate },
            update: { ...cwFields, ...pricesForUpdate, ...ohForUpdate },
          },
        };
      }

      return await this.prisma.spot.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      SpotlightUpdateException.throw(this.logger, {
        transactionId,
        id,
        spotData,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async delete(id: string, transactionId: string): Promise<void> {
    try {
      await this.prisma.spot.delete({
        where: { id },
      });
    } catch (error) {
      SpotlightDeleteException.throw(this.logger, {
        transactionId,
        id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
