'use client';

import { useEffect, useRef } from 'react';
import { sendTrackingEvents } from '@/queries/tracking';
import type { TrackingEvent } from '@/hooks/useAdvancedFileTracking';

interface DataroomTrackerProps {
  dataroomId: string;
  fileId?: string;
}

export function DataroomTracker({ dataroomId, fileId }: DataroomTrackerProps) {
  const sessionId = useRef<string>(undefined);
  const sessionStartTime = useRef<number>(undefined);
  const eventsQueue = useRef<TrackingEvent[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout>(undefined);
  
  // Configuration batch processing
  const BATCH_DURATION = 5000; // 5 secondes
  const MAX_BATCH_SIZE = 50;

  // Générer un ID de session unique
  useEffect(() => {
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime.current = Date.now();

    // Track session start
    trackEvent('session_start', {
      sessionStartTime: new Date().toISOString(),
    });

    // Cleanup function
    return () => {
      if (sessionStartTime.current) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        trackEvent('session_end', {
          sessionDuration,
          sessionEndTime: new Date().toISOString(),
        });
        
        // Flush remaining events
        flushEvents();
      }
    };
  }, [dataroomId]);

  // Track file view events
  useEffect(() => {
    if (fileId) {
      trackEvent('file_view', {
        viewStartTime: new Date().toISOString(),
      });

      // Track file view end when fileId changes or component unmounts
      return () => {
        trackEvent('file_view_end', {
          viewEndTime: new Date().toISOString(),
        });
      };
    }
  }, [fileId]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('page_hidden', {
          timestamp: new Date().toISOString(),
        });
        flushEvents(); // Flush events when page becomes hidden
      } else {
        trackEvent('page_visible', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track user interactions
  useEffect(() => {
    const trackDownload = (event: Event) => {
      const target = event.target as HTMLElement;
      const downloadLink = target.closest('[data-track-download]');
      if (downloadLink) {
        const fileName = downloadLink.getAttribute('data-file-name');
        const fileIdAttr = downloadLink.getAttribute('data-file-id');
        trackEvent('file_download', {
          fileName,
          fileId: fileIdAttr,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const trackClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Track file clicks
      const fileElement = target.closest('[data-track-file-click]');
      if (fileElement) {
        const fileName = fileElement.getAttribute('data-file-name');
        const fileIdAttr = fileElement.getAttribute('data-file-id');
        trackEvent('file_click', {
          fileName,
          fileId: fileIdAttr,
          timestamp: new Date().toISOString(),
        });
      }

      // Track analytics page access
      const analyticsElement = target.closest('[data-track-analytics]');
      if (analyticsElement) {
        trackEvent('analytics_access', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('click', trackDownload);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('click', trackDownload);
    };
  }, []);

  const trackEvent = (eventType: string, additionalData?: Record<string, any>) => {
    if (!sessionId.current) return;

    const event: TrackingEvent = {
      eventType,
      dataroomId,
      fileId: fileId || '',
      sessionId: sessionId.current,
      timestamp: new Date().toISOString(),
      sessionDuration: sessionStartTime.current ? Date.now() - sessionStartTime.current : 0,
      additionalData,
    };

    eventsQueue.current.push(event);

    // Schedule batch processing
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = setTimeout(() => {
      flushEvents();
    }, BATCH_DURATION);

    // Flush immediately if queue is full
    if (eventsQueue.current.length >= MAX_BATCH_SIZE) {
      flushEvents();
    }
  };

  const flushEvents = async () => {
    if (eventsQueue.current.length === 0) return;

    const events = [...eventsQueue.current];
    eventsQueue.current = [];

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
      batchTimeout.current = undefined;
    }

    try {
      // Utiliser la fonction existante de queries/tracking.ts
      await sendTrackingEvents(events);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des événements de tracking:', error);
      // Re-queue events for retry (simple strategy)
      eventsQueue.current.unshift(...events);
    }
  };

  // Expose trackEvent function globally for manual tracking
  useEffect(() => {
    (window as any).trackDataroomEvent = trackEvent;
    return () => {
      delete (window as any).trackDataroomEvent;
    };
  }, []);

  // This component doesn't render anything
  return null;
} 