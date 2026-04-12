import { useQuery } from '@tanstack/react-query';
import { getUserAnalytics, getUserTimeline } from '@/queries/tracking';

export function useUserAnalytics(
  dataroomId: string, 
  userId: string | null, 
  period: '24h' | '7d' | '30d' | '90d' = '7d'
) {
  return useQuery({
    queryKey: ['user-analytics', dataroomId, userId, period] as const,
    queryFn: () => getUserAnalytics({ dataroomId, userId: userId!, period }),
    enabled: !!dataroomId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUserTimeline(
  dataroomId: string, 
  userId: string | null, 
  period: '24h' | '7d' | '30d' | '90d' = '7d'
) {
  return useQuery({
    queryKey: ['user-timeline', dataroomId, userId, period] as const,
    queryFn: () => getUserTimeline({ dataroomId, userId: userId!, period }),
    enabled: !!dataroomId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 