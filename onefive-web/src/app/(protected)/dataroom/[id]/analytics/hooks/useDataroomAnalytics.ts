import { useMemo, useCallback, useState } from 'react';
import { useDataroomAnalytics as useDataroomAnalyticsQuery, useDataroomTimeline } from '@/queries/tracking';
import { DashboardStat, UserAnalytics, FileAnalytics, ActivityLog, ActivityChartDataPoint } from '../types';
import type { DataroomAnalytics } from '@/queries/tracking';

const PREVIOUS_PERIOD_MAP: Record<string, '24h' | '7d' | '30d' | '90d'> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
};

export interface UseDataroomAnalyticsReturn {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  dashboardStats: DashboardStat[];
  userAnalytics: UserAnalytics[];
  fileAnalytics: FileAnalytics[];
  activityLogs: ActivityLog[];
  activityChartData: ActivityChartDataPoint[];
  comparisonChartData: ActivityChartDataPoint[];
  isComparing: boolean;
  toggleComparison: () => void;
  rawData: DataroomAnalytics | null;
  lastUpdatedAt: Date | null;
  refetch: () => void;
}

export function useDataroomAnalytics(dataroomId: string, period: '24h' | '7d' | '30d' | '90d' = '7d'): UseDataroomAnalyticsReturn {
  const [isComparing, setIsComparing] = useState(false);

  const { data: rawData, isLoading, isError, error, refetch: refetchAnalytics, dataUpdatedAt } = useDataroomAnalyticsQuery(dataroomId, period);
  const { data: timelineData, isLoading: isTimelineLoading, refetch: refetchTimeline } = useDataroomTimeline(dataroomId, period);

  const previousPeriod = PREVIOUS_PERIOD_MAP[period];
  const { data: prevTimelineData } = useDataroomTimeline(
    isComparing ? dataroomId : '',
    previousPeriod
  );

  const toggleComparison = useCallback(() => setIsComparing(prev => !prev), []);

  const refetch = useCallback(() => {
    refetchAnalytics();
    refetchTimeline();
  }, [refetchAnalytics, refetchTimeline]);

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Il y a moins d'1h";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const { dashboardStats, userAnalytics, fileAnalytics, activityLogs, activityChartData } = useMemo(() => {
    if (!rawData) {
      return { dashboardStats: [], userAnalytics: [], fileAnalytics: [], activityLogs: [], activityChartData: [] };
    }

    const data = rawData as DataroomAnalytics & {
      viewsChange?: number;
      viewersChange?: number;
      sessionDurationChange?: number;
    };

    const stats: DashboardStat[] = [
      {
        label: "Total des vues",
        value: data.totalViews.toLocaleString(),
        change: data.viewsChange ? `${data.viewsChange > 0 ? '+' : ''}${data.viewsChange}%` : "-",
        trend: data.viewsChange ? (data.viewsChange > 0 ? "up" : data.viewsChange < 0 ? "down" : "stable") : "stable"
      },
      {
        label: "Utilisateurs actifs",
        value: data.uniqueViewers.toString(),
        change: data.viewersChange ? `${data.viewersChange > 0 ? '+' : ''}${data.viewersChange}` : "-",
        trend: data.viewersChange ? (data.viewersChange > 0 ? "up" : data.viewersChange < 0 ? "down" : "stable") : "stable"
      },
      {
        label: "Documents populaires",
        value: data.topFiles?.length.toString() || "0",
        change: "-",
        trend: "stable"
      },
      {
        label: "Temps moyen par session",
        value: formatDuration(data.avgSessionDuration),
        change: data.sessionDurationChange ? `${data.sessionDurationChange > 0 ? '+' : ''}${Math.floor(data.sessionDurationChange / 60)}m` : "-",
        trend: data.sessionDurationChange ? (data.sessionDurationChange > 0 ? "up" : data.sessionDurationChange < 0 ? "down" : "stable") : "stable"
      }
    ];

    const users: UserAnalytics[] = rawData.userActivity?.map((user) => ({
      id: user.userId,
      name: user.userName,
      email: user.userEmail || '',
      avatar: user.userAvatar || undefined,
      role: user.userRole || "Membre",
      group: user.userGroup || "",
      totalViews: user.totalViews ?? 0,
      uniqueDocuments: user.uniqueDocuments ?? 0,
      totalTimeSpent: formatTime(user.totalTime ?? 0),
      lastActivity: formatRelativeTime(user.lastActivity),
      documentsViewed: user.documentsViewed || []
    })) || [];

    const files: FileAnalytics[] = rawData.topFiles?.map((file) => ({
      id: file.fileId,
      name: file.fileName,
      category: file.category || "",
      totalViews: file.views,
      uniqueViewers: file.uniqueViewers ?? 0,
      avgTimeSpent: file.avgTimeSpent ? formatDuration(file.avgTimeSpent * 1000) : "0m 0s",
      downloadCount: file.downloadCount ?? 0,
      uploadedAt: file.uploadedAt || "",
      viewers: file.viewers || []
    })) || [];

    const RELEVANT_ACTIONS = ['Consulté', 'Téléchargé', 'Cliqué'];
    const logs: ActivityLog[] = (timelineData?.timeline || [])
      .filter((event) => RELEVANT_ACTIONS.includes(event.action))
      .map((event) => ({
        id: event.userId + '-' + event.timestamp,
        user: {
          name: event.userName,
          role: "User"
        },
        action: event.action,
        document: event.fileName,
        timestamp: event.timestamp,
        duration: event.duration ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s` : "0s",
      }));

    // Build chart data from timeline events grouped by date
    const chartMap = new Map<string, { views: number; viewers: Set<string> }>();
    timelineData?.timeline?.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const existing = chartMap.get(date) || { views: 0, viewers: new Set<string>() };
      existing.views += 1;
      existing.viewers.add(event.userId);
      chartMap.set(date, existing);
    });

    const chartData: ActivityChartDataPoint[] = Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      uniqueViewers: data.viewers.size,
    }));

    return {
      dashboardStats: stats,
      userAnalytics: users,
      fileAnalytics: files,
      activityLogs: logs,
      activityChartData: chartData,
    };
  }, [rawData, timelineData]);

  const comparisonChartData = useMemo(() => {
    if (!isComparing || !prevTimelineData?.timeline) return [];

    const chartMap = new Map<string, { views: number; viewers: Set<string> }>();
    prevTimelineData.timeline.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const existing = chartMap.get(date) || { views: 0, viewers: new Set<string>() };
      existing.views += 1;
      existing.viewers.add(event.userId);
      chartMap.set(date, existing);
    });

    return Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      uniqueViewers: data.viewers.size,
    }));
  }, [isComparing, prevTimelineData]);

  return {
    isLoading: isLoading || isTimelineLoading,
    isError: !!isError,
    error: error ? (error as Error).message || 'Erreur inconnue' : null,
    dashboardStats,
    userAnalytics,
    fileAnalytics,
    activityLogs,
    activityChartData,
    comparisonChartData,
    isComparing,
    toggleComparison,
    rawData: rawData || null,
    lastUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refetch,
  };
}
