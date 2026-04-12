import type { TrackingEvent } from '@/hooks/useAdvancedFileTracking';
import { sendTrackingEvents } from '@/queries/tracking';

interface TrackingServiceConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
}

class TrackingService {
  private config: TrackingServiceConfig;
  private eventQueue: TrackingEvent[] = [];
  private retryQueue: TrackingEvent[] = [];
  private isProcessing = false;
  private flushTimeout?: NodeJS.Timeout;
  private retryTimeout?: NodeJS.Timeout;

  constructor(config: Partial<TrackingServiceConfig> = {}) {
    this.config = {
      batchSize: 50,
      flushInterval: 5000, // 5 secondes
      maxRetries: 3,
      retryDelay: 2000, // 2 secondes
      ...config,
    };
  }

  /**
   * Ajoute un événement à la queue de tracking
   */
  addEvent(event: TrackingEvent): void {
    this.eventQueue.push(event);

    // Auto-flush si la queue est pleine
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    } else {
      // Programmer un flush
      this.scheduleFlush();
    }
  }

  /**
   * Ajoute plusieurs événements à la queue
   */
  addEvents(events: TrackingEvent[]): void {
    this.eventQueue.push(...events);

    // Auto-flush si la queue est pleine
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Programme un flush de la queue
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Force le flush de la queue
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    // Si déjà en cours de traitement, attendre un peu et réessayer
    if (this.isProcessing) {
      setTimeout(() => this.flush(), 100);
      return;
    }

    this.isProcessing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    // Annuler le timeout de flush programmé
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }

    try {
      await sendTrackingEvents(eventsToSend);
    } catch (error: any) {
      const isNetworkError = error?.name === 'TypeError' || 
        error?.message?.includes('fetch') || 
        error?.message?.includes('network');
      
      if (isNetworkError && this.retryQueue.length < this.config.batchSize * 3) {
        this.retryQueue.push(...eventsToSend);
        this.scheduleRetry();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Envoi immédiat et synchrone d'un événement critique
   */
  async sendImmediate(event: TrackingEvent): Promise<void> {
    try {
      await sendTrackingEvents([event]);
      // Critical event sent
    } catch {
      // Failed to send critical event, adding to queue
      // Ajouter à la queue normale en cas d'échec
      this.addEvent(event);
    }
  }

  /**
   * Programme un retry des événements échoués
   */
  private scheduleRetry(): void {
    if (this.retryTimeout) return; // Retry déjà programmé

    this.retryTimeout = setTimeout(async () => {
      await this.processRetryQueue();
      this.retryTimeout = undefined;
    }, this.config.retryDelay);
  }

  /**
   * Traite la queue de retry
   */
  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0) return;

    const eventsToRetry = [...this.retryQueue];
    this.retryQueue = [];

    try {
      await sendTrackingEvents(eventsToRetry);
    } catch {
      // Drop silently after retry failure
    }
  }

  /**
   * Envoie tous les événements en attente avant fermeture
   */
  async sendBeforeUnload(): Promise<void> {
    const allEvents = [...this.eventQueue, ...this.retryQueue];
    if (allEvents.length === 0) return;

    // Nettoyer les queues
    this.eventQueue = [];
    this.retryQueue = [];

    // Utiliser sendBeacon si disponible (plus fiable pour beforeunload)
    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const data = JSON.stringify({
        events: allEvents,
        metadata: {
          timestamp: new Date().toISOString(),
          reason: 'beforeunload',
          batchSize: allEvents.length,
        },
      });

      // Créer un Blob avec le bon Content-Type
      const blob = new Blob([data], { type: 'application/json' });

      const success = navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/dataroom/tracking/events`,
        blob
      );

      if (success) {
        return; // sendBeacon succeeded
      }
    } else {
      // Fallback : tentative d'envoi synchrone
      try {
        await sendTrackingEvents(allEvents);
      } catch {
        // Events lost on unload
      }
    }
  }

  /**
   * Nettoie les timeouts et ressources
   */
  cleanup(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
  }

  /**
   * Statistiques de la queue
   */
  getStats() {
    return {
      queueSize: this.eventQueue.length,
      retryQueueSize: this.retryQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Instance singleton
export const trackingService = new TrackingService();

// Types pour l'export
export type { TrackingServiceConfig }; 