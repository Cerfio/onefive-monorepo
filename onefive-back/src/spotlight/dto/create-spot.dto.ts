import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SpotType,
  ProviderType,
  ExpertiseDomain,
  Periodicity,
  Day,
  FundingModel,
  StartupStage,
  EventFormat,
  PrizeType,
} from '@prisma/client';

export class SpotPriceDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsNumber()
  fee: number;
}

export class PlanDto {
  @IsEnum(Periodicity)
  periodicity: Periodicity;

  @ValidateNested()
  @Type(() => SpotPriceDto)
  plan: SpotPriceDto;
}

export class OpeningHoursDto {
  @IsOptional()
  @IsString()
  begin?: string;

  @IsOptional()
  @IsString()
  end?: string;
}

export class SpotEventDto {
  @IsString()
  beginDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpotPriceDto)
  prices?: SpotPriceDto[];

  @IsArray()
  @IsEnum(ExpertiseDomain, { each: true })
  expertiseDomains: ExpertiseDomain[];

  @IsArray()
  @IsEnum(Day, { each: true })
  days: Day[];

  @IsString()
  uniqueId: string;

  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @IsOptional()
  @IsInt()
  attendees?: number;
}

export class SpotContestDto {
  @IsString()
  beginDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ExpertiseDomain, { each: true })
  expertiseDomains?: ExpertiseDomain[];

  @IsOptional()
  @IsEnum(PrizeType)
  prizeType?: PrizeType;

  @IsOptional()
  @IsNumber()
  prizeAmount?: number;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpotPriceDto)
  prices: SpotPriceDto[];
}

export class SpotIncubatorDto {
  @IsArray()
  @IsEnum(ExpertiseDomain, { each: true })
  expertiseDomains: ExpertiseDomain[];

  @IsOptional()
  @IsEnum(Periodicity)
  hiringPeriod?: Periodicity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dates?: string[];

  @IsOptional()
  @IsEnum(FundingModel)
  fundingModel?: FundingModel;

  @IsOptional()
  @IsNumber()
  equityPercentage?: number;

  @IsOptional()
  @IsNumber()
  investmentAmount?: number;

  @IsOptional()
  @IsEnum(StartupStage)
  stage?: StartupStage;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsInt()
  programDuration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  prices: PlanDto[];
}

export class SpotAcceleratorDto {
  @IsArray()
  @IsEnum(ExpertiseDomain, { each: true })
  expertiseDomains: ExpertiseDomain[];

  @IsOptional()
  @IsEnum(Periodicity)
  hiringPeriod?: Periodicity;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(FundingModel)
  fundingModel?: FundingModel;

  @IsOptional()
  @IsNumber()
  equityPercentage?: number;

  @IsOptional()
  @IsNumber()
  investmentAmount?: number;

  @IsOptional()
  @IsEnum(StartupStage)
  stage?: StartupStage;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsInt()
  programDuration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  prices: PlanDto[];
}

export class SpotCoworkingSpaceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  prices: PlanDto[];
}

export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateSpotDto {
  @IsEnum(SpotType)
  spot: SpotType;

  @IsString()
  name: string;

  @IsString()
  highlight: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  image?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsEnum(ProviderType)
  provider: ProviderType;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpotEventDto)
  event?: SpotEventDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpotContestDto)
  contest?: SpotContestDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpotIncubatorDto)
  incubator?: SpotIncubatorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpotAcceleratorDto)
  accelerator?: SpotAcceleratorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpotCoworkingSpaceDto)
  coworkingSpace?: SpotCoworkingSpaceDto;

  @IsString()
  url: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  raw?: Record<string, unknown>;
}
