import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum NetworkView {
  DISCOVER = 'discover',
  NETWORK = 'network',
}

export enum NetworkSubView {
  CONNECTIONS = 'connections',
  FEED = 'feed',
}

export enum SortOption {
  RECENT = 'recent',
  NAME = 'name',
  LOCATION = 'location',
}

export class GetNetworkPeopleDto {
  @IsEnum(NetworkView)
  view: NetworkView;

  @IsOptional()
  @IsEnum(NetworkSubView)
  subView?: NetworkSubView;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  intention?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
