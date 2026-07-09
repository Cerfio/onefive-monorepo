import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, merge } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

// Keep-alive pour empêcher les proxys de couper un stream SSE idle.
const HEARTBEAT_MS = 25_000;

/**
 * Hub SSE des notifications temps réel (push serveur -> client), calqué sur
 * MessagingEventsService. 1 stream par profil (multi-onglets). Remplace le
 * polling 30s : dès qu'une notification est créée, on la pousse.
 */
@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);
  private readonly streams = new Map<string, Set<Subject<MessageEvent>>>();

  subscribe(profileId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    let set = this.streams.get(profileId);
    if (!set) {
      set = new Set();
      this.streams.set(profileId, set);
    }
    set.add(subject);

    const heartbeat = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );

    return merge(subject.asObservable(), heartbeat).pipe(
      finalize(() => {
        const current = this.streams.get(profileId);
        current?.delete(subject);
        subject.complete();
        if (current && current.size === 0) this.streams.delete(profileId);
      }),
    );
  }

  /** Pousse un event vers tous les streams ouverts d'un profil. */
  emit(profileId: string, type: string, data: unknown): void {
    const set = this.streams.get(profileId);
    if (!set) return;
    for (const subject of set) {
      subject.next({ type, data: data as object });
    }
  }
}
