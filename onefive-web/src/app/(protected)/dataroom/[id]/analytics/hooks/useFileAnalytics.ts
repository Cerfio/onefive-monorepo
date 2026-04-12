import { useQuery } from '@tanstack/react-query';
import { getFileAnalytics } from '@/queries/tracking';

export function useFileAnalytics(
  dataroomId: string, 
  fileId: string | null, 
  period: '24h' | '7d' | '30d' | '90d' = '7d'
) {
  return useQuery({
    queryKey: ['file-analytics', dataroomId, fileId, period] as const,
    queryFn: () => getFileAnalytics({ dataroomId, fileId: fileId!, period }),
    enabled: !!dataroomId && !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
} 