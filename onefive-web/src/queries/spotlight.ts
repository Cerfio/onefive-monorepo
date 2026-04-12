import { ProviderType, SpotType } from '@/sharing-enum/spotlight/spotlight.enum';
import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema for location in {lat, lng} format
const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const spotlightSchema = z.object({
  success: z.boolean(),
  data: z.object({
    count: z.number(),
    payload: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        highlight: z.string().nullable(),
        address: z.string().nullable(),
        image: z.string().nullable(),
        url: z.string().nullable(),
        location: locationSchema.nullable(),
        provider: z.nativeEnum(ProviderType),
        spot: z.nativeEnum(SpotType),

        // Backend returns raw Prisma objects: prices have planId/plan, dates may vary, etc.
        // Use permissive schemas to accept the API response structure.
        contest: z
          .object({
            beginDate: z.union([z.string(), z.date()]).optional(),
            endDate: z.union([z.string(), z.date()]).optional(),
            expertiseDomains: z.array(z.string()).optional(),
            prizeType: z.string().optional().nullable(),
            prizeAmount: z.number().optional().nullable(),
            eligibility: z.string().optional().nullable(),
            prices: z.array(z.record(z.unknown())).optional(),
          })
          .passthrough()
          .nullable()
          .optional(),

        incubator: z
          .object({
            expertiseDomains: z.array(z.string()).optional(),
            hiringPeriod: z.string().optional().nullable(),
            dates: z.array(z.string()).optional(),
            fundingModel: z.string().optional().nullable(),
            equityPercentage: z.number().optional().nullable(),
            investmentAmount: z.number().optional().nullable(),
            stage: z.string().optional().nullable(),
            capacity: z.number().optional().nullable(),
            programDuration: z.number().optional().nullable(),
            prices: z.array(z.record(z.unknown())).optional(),
          })
          .passthrough()
          .nullable()
          .optional(),

        accelerator: z
          .object({
            expertiseDomains: z.array(z.string()).optional(),
            hiringPeriod: z.string().optional().nullable(),
            date: z.union([z.string(), z.date()]).optional().nullable(),
            fundingModel: z.string().optional().nullable(),
            equityPercentage: z.number().optional().nullable(),
            investmentAmount: z.number().optional().nullable(),
            stage: z.string().optional().nullable(),
            capacity: z.number().optional().nullable(),
            programDuration: z.number().optional().nullable(),
            prices: z.array(z.record(z.unknown())).optional(),
          })
          .passthrough()
          .nullable()
          .optional(),

        coworkingSpace: z
          .object({
            prices: z.array(z.record(z.unknown())).optional(),
            openingHours: z
              .object({
                begin: z.string(),
                end: z.string(),
              })
              .optional()
              .nullable(),
          })
          .passthrough()
          .nullable()
          .optional(),

        event: z
          .object({
            expertiseDomains: z.array(z.string()).optional(),
            days: z.array(z.string()).optional(),
            format: z.string().optional().nullable(),
            attendees: z.number().optional().nullable(),
            beginDate: z.union([z.string(), z.date()]).optional(),
            endDate: z.union([z.string(), z.date()]).optional(),
          })
          .passthrough()
          .nullable()
          .optional(),
      })
    )
  })
});

// type Spotlight Incubator
type SpotlightIncubator = z.infer<typeof spotlightSchema>['data']['payload'][number]['incubator'];
type SpotlightEvent = z.infer<typeof spotlightSchema>['data']['payload'][number]['event'];
export type SpotlightIncubatorWithSpotData = {
  id: string,
  name: string,
  highlight: string,
  address: string,
  image: string,
  location: {
    lat: number,
    lng: number,
  },
  provider: ProviderType,
  spot: SpotType,
} & { incubator: SpotlightIncubator };

export type SpotlightEventWithSpotData = {
  id: string,
  name: string,
  highlight: string,
  address: string,
  image: string,
  location: {
    lat: number,
    lng: number,
  },
  provider: ProviderType,
  spot: SpotType,
  url: string,
} & { event: SpotlightEvent };


export interface ListSpotlightParams {
  latitude: number;
  longitude: number;
  spot?: string[];
  provider?: string[];
  expertiseDomains?: string[];
  cost?: string[];
  beginDate?: string;
  endDate?: string;
  take?: number;
  skip?: number;
}

export const listSpotlight = async ({
  latitude,
  longitude,
  spot = [],
  provider = [],
  expertiseDomains = [],
  cost = [],
  beginDate,
  endDate,
  take = 10,
  skip = 0,
}: ListSpotlightParams) => {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      take: take.toString(),
      skip: skip.toString(),
    });

    if (spot.length > 0) params.set('spot', spot.join(','));
    if (provider.length > 0) params.set('provider', provider.join(','));
    if (expertiseDomains.length > 0) {
      params.set('expertiseDomains', expertiseDomains.join(','));
    }
    if (cost.length > 0) params.set('cost', cost.join(','));
    if (beginDate) params.set('beginDate', beginDate);
    if (endDate) params.set('endDate', endDate);

    const response = await api.get(`spotlight?${params.toString()}`);
    const payload: any = await response.json();
    const parse = spotlightSchema.parse(payload);
    return parse.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch spotlight list: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to fetch spotlight list: Error ONE-2');
    } else {
      toast.error('Unable to fetch spotlight list: Error ONE-3');
    }
    throw Error('Unable to fetch spotlight list');
  }
};
