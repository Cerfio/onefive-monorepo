import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeRange } from './get-visitors-analytics.dto';

export class GetEngagementAnalyticsQueryDto {
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'views' | 'likes' | 'comments' | 'shares';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export interface ViewTrendItem {
  day: string;
  views: number;
}

export interface AudienceByRole {
  role: string;
  count: number;
  color: string;
}

export interface AudienceBySeniority {
  level: string;
  count: number;
  color: string;
}

export interface PostAudience {
  byRole: AudienceByRole[];
  bySeniority: AudienceBySeniority[];
}

export interface PostDetails {
  viewTrend: ViewTrendItem[];
  audience: PostAudience;
  engagementRate: number;
}

export type ContentType = 'post' | 'discussion';

export interface PostEngagementStats {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  type: ContentType;
  details: PostDetails;
}

export interface WeeklyDataItem {
  week: string;
  views: number;
  connections: number;
  posts: number;
  discussions: number;
  engagement: number;
}

export interface EngagementAnalyticsResponseDto {
  posts: PostEngagementStats[];
  weeklyData: WeeklyDataItem[];
  totalPosts: number;
  totalDiscussions: number;
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
}
