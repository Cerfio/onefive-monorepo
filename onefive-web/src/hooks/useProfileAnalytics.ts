import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

// ==================== TYPES ====================

export type TimeRange = '7d' | '30d' | '90d' | '1y';

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

export interface VisitorsAnalyticsData {
  total: number;
  thisWeek: number;
  thisMonth: number;
  networkBreakdown: NetworkBreakdown;
  topCountries: CountryVisitors[];
  recentVisitors: RecentVisitor[];
  onefiveProfileTypes: ProfileTypeCount[];
}

// ==================== ENGAGEMENT TYPES ====================

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

export interface EngagementAnalyticsData {
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ==================== QUERIES ====================

export const useVisitorsAnalytics = (timeRange: TimeRange = '30d') => {
  return useQuery({
    queryKey: ['visitors-analytics', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);

      const response = await api.get(`profile-analytics/visitors?${params}`);
      const result = (await response.json()) as ApiResponse<VisitorsAnalyticsData>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch visitors analytics');
      }

      return result.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

export interface UseEngagementAnalyticsOptions {
  timeRange?: TimeRange;
  skip?: number;
  limit?: number;
  search?: string;
  sortBy?: 'date' | 'views' | 'likes' | 'comments' | 'shares';
  sortOrder?: 'asc' | 'desc';
}

export const useEngagementAnalytics = (options: UseEngagementAnalyticsOptions = {}) => {
  const {
    timeRange = '30d',
    skip = 0,
    limit = 10,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  } = options;

  return useQuery({
    queryKey: ['engagement-analytics', timeRange, skip, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`profile-analytics/engagement?${params}`);
      const result = (await response.json()) as ApiResponse<EngagementAnalyticsData>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch engagement analytics');
      }

      return result.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

// ==================== OVERVIEW TYPES ====================

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

export interface OverviewAnalyticsData {
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

export const useOverviewAnalytics = (timeRange: TimeRange = '30d') => {
  return useQuery({
    queryKey: ['overview-analytics', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);

      const response = await api.get(`profile-analytics/overview?${params}`);
      const result = (await response.json()) as ApiResponse<OverviewAnalyticsData>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch overview analytics');
      }

      return result.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};
