import { IsEnum, IsOptional } from 'class-validator';
import { TimeRange } from './get-visitors-analytics.dto';

export class GetOverviewAnalyticsQueryDto {
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;
}

export interface ChartDataPoint {
  value: number;
}

export interface OverviewMetric {
  current: number;
  previous: number;
  change: number;
  chartData: ChartDataPoint[];
}

export interface TopProfileType {
  type: string;
  count: number;
  change: number;
}

export interface OverviewAnalyticsResponseDto {
  profileViews: OverviewMetric;
  connections: OverviewMetric;
  posts: OverviewMetric;
  discussions: OverviewMetric;
  engagement: OverviewMetric;
  topProfileType: TopProfileType;
  networkQuality: OverviewMetric;
  searchAppearances: OverviewMetric;
  profileCompletion: OverviewMetric;
  weeklyData: Array<{
    week: string;
    views: number;
  }>;
}
