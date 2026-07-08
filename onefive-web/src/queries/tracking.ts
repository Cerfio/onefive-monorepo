import { api } from '@/utils/kyInstance';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import type { TrackingEvent } from '@/hooks/useAdvancedFileTracking';

// Schémas de validation
const trackingEventSchema = z.object({
  eventType: z.string(),
  dataroomId: z.string(),
  fileId: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
  sessionDuration: z.number().optional(),
  additionalData: z.record(z.any()).optional(),
});

const trackingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    processedEvents: z.number(),
    message: z.string(),
    errors: z.array(z.string()).optional(),
  }),
});

const analyticsResponseSchema = z.object({
  data: z.object({
    dataroomId: z.string(),
    totalViews: z.number(),
    uniqueViewers: z.number(),
    avgSessionDuration: z.number(),
    topFiles: z.array(z.object({
      fileId: z.string(),
      fileName: z.string(),
      views: z.number(),
      category: z.string().optional(),
      uploadedAt: z.string().optional(),
      downloadCount: z.number().optional(),
      uniqueViewers: z.number().optional(),
      avgTimeSpent: z.number().optional(),
      viewers: z.array(z.object({
        userId: z.string().optional(),
        userName: z.string().optional(),
      })).optional(),
    })),
    userActivity: z.array(z.object({
      userId: z.string(),
      userName: z.string(),
      lastActivity: z.string(),
      totalTime: z.number().optional(),
      totalViews: z.number().optional(),
      views: z.number().optional(),
      sessionDuration: z.number().optional(),
      userEmail: z.string().optional(),
      userRole: z.string().optional(),
      userGroup: z.string().optional(),
      userAvatar: z.string().nullable().optional(),
      uniqueDocuments: z.number().optional(),
      documentsViewed: z.array(z.string()).optional(),
    })),
  }),
});

/**
 * Envoie des événements de tracking au microservice dataroom.
 * Fire-and-forget : les erreurs de parsing de la réponse ne doivent
 * jamais remonter ni déclencher de retry.
 */
export const sendTrackingEvents = async (events: TrackingEvent[]) => {
  const validEvents = events.filter(event => {
    try {
      trackingEventSchema.parse(event);
      return true;
    } catch {
      return false;
    }
  });

  if (validEvents.length === 0) return { processedEvents: 0, message: 'no valid events' };

  const response = await api.post('dataroom/tracking/events', {
    json: {
      events: validEvents,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        batchSize: validEvents.length,
      },
    },
  });

  const json = await response.json();
  const parsed = trackingResponseSchema.safeParse(json);

  if (parsed.success) {
    return parsed.data.data;
  }

  return { processedEvents: validEvents.length, message: 'sent (response shape mismatch)' };
};

/**
 * Envoie un événement de tracking unique
 */
export const sendTrackingEvent = async (event: TrackingEvent) => {
  return sendTrackingEvents([event]);
};

/**
 * Récupère les analytics d'une dataroom
 */
export const getDataroomAnalytics = async ({ 
  dataroomId, 
  period = '7d' 
}: { 
  dataroomId: string; 
  period?: '24h' | '7d' | '30d' | '90d';
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/analytics`,
      {
        searchParams: { period },
      },
    );

    const parse = analyticsResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    console.error('Failed to fetch dataroom analytics:', error);
    throw error;
  }
};

const fileAnalyticsResponseSchema = z.object({
  data: z.object({
    fileId: z.string(),
    fileName: z.string(),
    totalViews: z.number(),
    uniqueViewers: z.number(),
    avgSessionDuration: z.number().optional(),
    avgTimeSpent: z.number().optional(),
    category: z.string().optional(),
    uploadedAt: z.string().optional(),
    downloadCount: z.number().optional(),
    lastViewed: z.string().optional(),
    userActivity: z.array(z.object({
      userId: z.string(),
      userName: z.string(),
      userAvatar: z.string().nullable().optional(),
      lastActivity: z.string(),
      totalTime: z.number(),
      userEmail: z.string().optional(),
      userRole: z.string().optional(),
      timeSpentFormatted: z.string().optional(),
    })).optional(),
    pageViews: z.array(z.object({ page: z.number(), views: z.number() })).optional(),
  }),
});

/**
 * Récupère les analytics d'un fichier spécifique
 */
export const getFileAnalytics = async ({ 
  dataroomId, 
  fileId, 
  period = '7d' 
}: { 
  dataroomId: string; 
  fileId: string;
  period?: '24h' | '7d' | '30d' | '90d';
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/file/${fileId}/analytics`,
      {
        searchParams: { period },
      },
    );

    const parse = fileAnalyticsResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    console.error('Failed to fetch file analytics:', error);
    throw error;
  }
};

const userAnalyticsResponseSchema = z.object({
  data: z.object({
    userId: z.string(),
    userName: z.string(),
    totalViews: z.number(),
    totalTime: z.number().optional(),
    totalTimeSpent: z.number().optional(),
    lastActivity: z.string(),
    userEmail: z.string().optional(),
    userRole: z.string().optional(),
    userGroup: z.string().optional(),
    totalTimeFormatted: z.string().optional(),
    filesViewed: z.number().optional(),
    avgSessionDuration: z.number().optional(),
    fileActivity: z.array(z.object({
      fileId: z.string(),
      fileName: z.string(),
      views: z.number(),
      timeSpent: z.number(),
      category: z.string().optional(),
      timeSpentFormatted: z.string().optional(),
    })).optional(),
  }),
});

/**
 * Récupère les analytics d'un utilisateur spécifique
 */
export const getUserAnalytics = async ({ 
  dataroomId, 
  userId, 
  period = '7d' 
}: { 
  dataroomId: string; 
  userId: string;
  period?: '24h' | '7d' | '30d' | '90d';
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/user/${userId}/analytics`,
      {
        searchParams: { period },
      },
    );

    const parse = userAnalyticsResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    console.error('Failed to fetch user analytics:', error);
    throw error;
  }
};

const userTimelineResponseSchema = z.object({
  data: z.object({
    userId: z.string(),
    userName: z.string(),
    timeline: z.array(z.object({
      timestamp: z.string(),
      eventType: z.string(),
      fileId: z.string(),
      fileName: z.string(),
      action: z.string(),
      duration: z.number().optional(),
    })),
  }),
});

/**
 * Récupère la timeline d'activité détaillée d'un utilisateur
 */
export const getUserTimeline = async ({ 
  dataroomId, 
  userId, 
  period = '7d' 
}: { 
  dataroomId: string; 
  userId: string;
  period?: '24h' | '7d' | '30d' | '90d';
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/user/${userId}/timeline`,
      {
        searchParams: { period },
      },
    );

    const parse = userTimelineResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    console.error('Failed to fetch user timeline:', error);
    throw error;
  }
};

const dataroomTimelineResponseSchema = z.object({
  data: z.object({
    dataroomId: z.string(),
    timeline: z.array(z.object({
      timestamp: z.string(),
      eventType: z.string(),
      userId: z.string(),
      userName: z.string(),
      fileId: z.string(),
      fileName: z.string(),
      action: z.string(),
      duration: z.number().optional(),
    })),
  }),
});

/**
 * Récupère la timeline d'activité globale d'une dataroom
 */
export const getDataroomTimeline = async ({ 
  dataroomId, 
  period = '7d' 
}: { 
  dataroomId: string;
  period?: '24h' | '7d' | '30d' | '90d';
}) => {
  try {
    const response = await api.get(`dataroom/${dataroomId}/timeline`,
      {
        searchParams: { period },
      },
    );

    const parse = dataroomTimelineResponseSchema.parse(await response.json());
    return parse.data;
  } catch (error: any) {
    console.error('Failed to fetch dataroom timeline:', error);
    throw error;
  }
};

// Types exportés pour TypeScript
export type TrackingResponse = z.infer<typeof trackingResponseSchema>['data'];
export type DataroomAnalytics = z.infer<typeof analyticsResponseSchema>['data'];
export type UserTimeline = z.infer<typeof userTimelineResponseSchema>['data'];

// Hooks React Query pour les analytics (optionnels, pour utilisation future)
export const useDataroomAnalytics = (dataroomId: string, period: '24h' | '7d' | '30d' | '90d' = '7d') => {
  return useQuery({
    queryKey: ['dataroom-analytics', dataroomId, period] as const,
    queryFn: () => getDataroomAnalytics({ dataroomId, period }),
    enabled: !!dataroomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useFileAnalytics = (dataroomId: string, fileId: string, period: '24h' | '7d' | '30d' | '90d' = '7d') => {
  return useQuery({
    queryKey: ['file-analytics', dataroomId, fileId, period] as const,
    queryFn: () => getFileAnalytics({ dataroomId, fileId, period }),
    enabled: !!dataroomId && !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUserTimeline = (dataroomId: string, userId: string, period: '24h' | '7d' | '30d' | '90d' = '7d') => {
  return useQuery({
    queryKey: ['user-timeline', dataroomId, userId, period] as const,
    queryFn: () => getUserTimeline({ dataroomId, userId, period }),
    enabled: !!dataroomId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useDataroomTimeline = (dataroomId: string, period: '24h' | '7d' | '30d' | '90d' = '7d') => {
  return useQuery({
    queryKey: ['dataroom-timeline', dataroomId, period] as const,
    queryFn: () => getDataroomTimeline({ dataroomId, period }),
    enabled: !!dataroomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}; 