'use client';

import { useNotificationsRealtime } from '@/hooks/useNotificationsApi';

/**
 * Monté une fois dans le layout protégé : ouvre le stream SSE des notifications
 * pour un push temps réel (remplace l'attente du polling 30s). Ne rend rien.
 */
export const NotificationsRealtime = () => {
  useNotificationsRealtime();
  return null;
};
