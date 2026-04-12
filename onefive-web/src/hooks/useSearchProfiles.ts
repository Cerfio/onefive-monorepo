import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

export interface Profile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  highlight: string | null;
  countryCode: string | null;
  email: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const useSearchProfiles = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['searchProfiles', query, limit],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());

      const response = await api.get(`profile/search?${params}`);
      const result = await response.json() as ApiResponse<Profile[]>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to search profiles');
      }

      return result.data;
    },
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

