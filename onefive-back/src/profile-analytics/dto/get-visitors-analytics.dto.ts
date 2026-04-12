import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimeRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  ONE_YEAR = '1y',
}

export class GetVisitorsAnalyticsQueryDto {
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;
}

export interface RecentVisitor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string | null;
  avatar: string | null;
  visitedAt: string;
  isFromNetwork: boolean;
  mutualConnections: number;
  ecosystemRoles: string[];
}

export interface NetworkBreakdown {
  fromNetwork: number;
  fromOutside: number;
  mutualConnections: number;
  directConnections: number;
}

export interface ProfileTypeCount {
  type: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export interface CountryVisitors {
  country: string;
  count: number;
  percentage: number;
}

export interface VisitorsAnalyticsResponseDto {
  total: number;
  thisWeek: number;
  thisMonth: number;
  networkBreakdown: NetworkBreakdown;
  topCountries: CountryVisitors[];
  recentVisitors: RecentVisitor[];
  onefiveProfileTypes: ProfileTypeCount[];
}
