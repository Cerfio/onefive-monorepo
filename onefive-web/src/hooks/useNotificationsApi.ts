import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/utils/kyInstance';

const NOTIF_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

// Types
export interface NotificationItem {
  id: string;
  type: string;
  category: 'engagement' | 'invitations' | 'system';
  title: string;
  message: string;
  read: boolean;
  actorId?: string;
  actorAvatar?: string | null;
  entityId?: string;
  entityType?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationCounts {
  engagement: number;
  invitations: number;
  system: number;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  hasMore: boolean;
}

export interface NotificationCountsResponse {
  counts: NotificationCounts;
  total: number;
  hasUnread: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: { category?: string; read?: boolean; limit?: number; offset?: number }) => 
    [...notificationKeys.lists(), filters] as const,
  counts: () => [...notificationKeys.all, 'counts'] as const,
};

// API Functions
const fetchNotifications = async (options?: {
  category?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (options?.category) params.append('category', options.category);
  if (options?.read !== undefined) params.append('read', String(options.read));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));

  const queryString = params.toString();
  const url = queryString ? `notifications?${queryString}` : 'notifications';
  
  const response = await api.get(url);
  const result = await response.json() as ApiResponse<{
    items?: NotificationItem[];
    notifications?: NotificationItem[];
    total: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  }>;
  
  if (result.success && result.data) {
    const data = result.data;
    // Backend returns items (paginated), normalize to notifications for compatibility
    const notifications = data.items ?? data.notifications ?? [];
    return {
      notifications,
      total: data.total ?? notifications.length,
      hasMore: data.hasMore ?? false,
    };
  }
  
  throw new Error(result.error || 'Failed to fetch notifications');
};

const fetchNotificationCounts = async (): Promise<NotificationCountsResponse> => {
  const response = await api.get('notifications/counts');
  const result = await response.json() as ApiResponse<NotificationCountsResponse>;
  
  if (result.success && result.data) {
    return result.data;
  }
  
  throw new Error(result.error || 'Failed to fetch notification counts');
};

const markNotificationRead = async (notificationId: string): Promise<void> => {
  const response = await api.patch(`notifications/${notificationId}/read`);
  const result = await response.json() as ApiResponse<{ marked: boolean }>;
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to mark notification as read');
  }
};

const markAllNotificationsRead = async (category?: string): Promise<void> => {
  const url = category 
    ? `notifications/read-all?category=${category}` 
    : 'notifications/read-all';
    
  const response = await api.patch(url);
  const result = await response.json() as ApiResponse<{ markedCount: number }>;
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to mark all notifications as read');
  }
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await api.delete(`notifications/${notificationId}`);
  const result = await response.json() as ApiResponse<{ deleted: boolean }>;
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete notification');
  }
};

// Hooks

/**
 * Hook pour récupérer la liste des notifications
 */
export const useNotificationsList = (options?: {
  category?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: notificationKeys.list({
      category: options?.category,
      read: options?.read,
      limit: options?.limit,
      offset: options?.offset,
    }),
    queryFn: () => fetchNotifications(options),
    staleTime: 10 * 1000, // 10 secondes
    refetchInterval: 30 * 1000, // Refresh toutes les 30 secondes
    enabled: options?.enabled !== false,
  });
};

/**
 * Hook pour récupérer les compteurs de notifications (utilisé par la cloche)
 */
export const useNotificationCounts = () => {
  return useQuery({
    queryKey: notificationKeys.counts(),
    queryFn: fetchNotificationCounts,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 30 * 1000, // Refresh toutes les 30 secondes pour la cloche
  });
};

/**
 * Hook pour marquer une notification comme lue
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalider les queries pour rafraîchir
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Hook pour marquer toutes les notifications comme lues
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalider les queries pour rafraîchir
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Hook pour supprimer une notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      // Invalider les queries pour rafraîchir
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Hook combiné pour la cloche de notification (compteurs + actions)
 * C'est celui à utiliser dans NotificationDropdown
 */
export const useNotificationsDropdown = () => {
  const countsQuery = useNotificationCounts();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const counts = countsQuery.data?.counts ?? { engagement: 0, invitations: 0, system: 0 };
  const total = countsQuery.data?.total ?? 0;
  const hasUnread = countsQuery.data?.hasUnread ?? false;

  return {
    // État
    counts,
    totalCount: total,
    hasUnread,
    isLoading: countsQuery.isLoading,
    error: countsQuery.error instanceof Error ? countsQuery.error.message : null,
    
    // Actions
    markAllAsRead: (category?: string) => markAllReadMutation.mutateAsync(category),
    isMarkingAllRead: markAllReadMutation.isPending,
    
    // Refresh manuel
    refresh: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  };
};

/**
 * Abonnement temps réel (SSE) aux notifications : ouvre un EventSource vers
 * l'endpoint push du backend et invalide les queries de notifs dès qu'une
 * nouvelle arrive — au lieu d'attendre le polling 30s. À monter une fois
 * (layout protégé). EventSource gère la reconnexion automatiquement.
 */
export const useNotificationsRealtime = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${NOTIF_API_URL}/notifications/events`, {
        withCredentials: true,
      });
    } catch {
      return;
    }
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };
    es.addEventListener('notification:new', handler);
    return () => {
      es?.removeEventListener('notification:new', handler);
      es?.close();
    };
  }, [queryClient]);
};
