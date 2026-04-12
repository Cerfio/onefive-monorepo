import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../settings.api';

export const useUserSettings = () => {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: settingsApi.getUserSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

