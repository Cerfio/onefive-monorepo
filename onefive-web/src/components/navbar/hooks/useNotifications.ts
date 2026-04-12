import { useState, useCallback, useEffect } from 'react';
import { useNotificationsDropdown } from '@/hooks/useNotificationsApi';
import { NAVBAR_CONSTANTS } from '../constants';

export interface NotificationCounts {
  engagement: number;
  invitations: number;
  system: number;
}

export interface UseNotificationsReturn {
  hasUnread: boolean;
  counts: NotificationCounts;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  markAllAsRead: () => void;
  markCategoryAsRead: (category: keyof NotificationCounts) => void;
  refresh: () => Promise<void>;
}

// Fallback counts (0 quand l'API est indisponible — pas de faux badges)
const _FALLBACK_COUNTS: NotificationCounts = {
  engagement: NAVBAR_CONSTANTS.DEFAULTS.NOTIFICATIONS.ENGAGEMENT,
  invitations: NAVBAR_CONSTANTS.DEFAULTS.NOTIFICATIONS.INVITATIONS,
  system: NAVBAR_CONSTANTS.DEFAULTS.NOTIFICATIONS.SYSTEM,
};

export const useNotifications = (): UseNotificationsReturn => {
  // Utiliser le hook API
  const {
    counts: apiCounts,
    totalCount: apiTotalCount,
    hasUnread: apiHasUnread,
    isLoading,
    error,
    markAllAsRead: apiMarkAllAsRead,
    refresh: apiRefresh,
  } = useNotificationsDropdown();

  // State local pour le fallback et les mises à jour optimistes
  const [localCounts, setLocalCounts] = useState<NotificationCounts | null>(null);

  // Utiliser uniquement les données API (pas de fallback)
  const counts = localCounts ?? apiCounts;
  
  const totalCount = localCounts 
    ? localCounts.engagement + localCounts.invitations + localCounts.system
    : apiTotalCount;
  
  const hasUnread = apiHasUnread || totalCount > 0;

  const markAllAsRead = useCallback(async () => {
    // Mise à jour optimiste
    setLocalCounts({ engagement: 0, invitations: 0, system: 0 });
    
    try {
      await apiMarkAllAsRead();
    } catch (err) {
      // En cas d'erreur, on garde le state optimiste (meilleure UX)
      console.error('Failed to mark all as read:', err);
    }
  }, [apiMarkAllAsRead]);

  const markCategoryAsRead = useCallback(async (category: keyof NotificationCounts) => {
    // Mise à jour optimiste
    setLocalCounts(prev => ({
      ...(prev ?? counts),
      [category]: 0,
    }));
    
    try {
      await apiMarkAllAsRead(category.toUpperCase());
    } catch (err) {
      console.error(`Failed to mark ${category} as read:`, err);
    }
  }, [apiMarkAllAsRead, counts]);

  const refresh = useCallback(async () => {
    apiRefresh();
  }, [apiRefresh]);

  // Reset local counts quand les données API changent
  useEffect(() => {
    if (apiCounts.engagement > 0 || apiCounts.invitations > 0 || apiCounts.system > 0) {
      setLocalCounts(null);
    }
  }, [apiCounts]);

  return {
    hasUnread,
    counts,
    totalCount,
    isLoading,
    error,
    markAllAsRead,
    markCategoryAsRead,
    refresh,
  };
}; 