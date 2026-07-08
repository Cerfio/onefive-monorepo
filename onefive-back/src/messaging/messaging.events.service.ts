import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, merge } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { MessagingService } from './messaging.service';
import { ProfileConnectionService } from '../profile-connection/profile-connection.service';

// Intervalle de keep-alive pour empêcher les proxys de couper un stream SSE idle.
const HEARTBEAT_MS = 25_000;

/**
 * Hub de notifications temps réel via Server-Sent Events (SSE).
 *
 * Remplace l'ancien MessagingGateway (Socket.IO). Architecture :
 * - 1 stream SSE par profil (multi-onglets supportés : Set<Subject> par profileId).
 * - Le serveur ne fait QUE pousser (server -> client). Les actions client -> serveur
 *   (envoi message, typing, read…) passent par les endpoints REST du controller.
 * - Le routing des events se fait par membership conversation (lookup DB),
 *   plus besoin de join/leave en mémoire comme avec les rooms Socket.IO.
 *
 * NOTE: on manipule des profileId (jamais userId) pour éviter toute exposition.
 */
@Injectable()
export class MessagingEventsService {
  private readonly logger = new Logger(MessagingEventsService.name);

  // profileId -> Set des streams ouverts (un par onglet/connexion)
  private readonly streams = new Map<string, Set<Subject<MessageEvent>>>();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly profileConnectionService: ProfileConnectionService,
  ) {}

  // ==================== STREAM LIFECYCLE ====================

  /**
   * Ouvrir un stream SSE pour un profil. Appelé par le controller (@Sse).
   * Gère la présence online/offline (premier/dernier onglet) et un heartbeat.
   */
  subscribe(profileId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    let set = this.streams.get(profileId);
    const isFirstConnection = !set || set.size === 0;
    if (!set) {
      set = new Set();
      this.streams.set(profileId, set);
    }
    set.add(subject);

    this.logger.log(
      `SSE connected: profileId=${profileId} (tabs=${set.size})`,
    );

    if (isFirstConnection) {
      void this.broadcastPresenceUpdate(profileId, 'online');
    }

    const heartbeat = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );

    return merge(subject.asObservable(), heartbeat).pipe(
      finalize(() => {
        const current = this.streams.get(profileId);
        current?.delete(subject);
        subject.complete();

        if (current && current.size === 0) {
          this.streams.delete(profileId);
          void this.broadcastPresenceUpdate(profileId, 'offline');
        }

        this.logger.log(
          `SSE disconnected: profileId=${profileId} (tabs=${current?.size ?? 0})`,
        );
      }),
    );
  }

  /**
   * Pousser un event vers une liste de profils.
   * @param excludeProfileId profil à exclure (ex: l'auteur d'un message)
   */
  private emitToProfiles(
    profileIds: string[],
    type: string,
    data: unknown,
    excludeProfileId?: string,
  ): void {
    for (const profileId of profileIds) {
      if (excludeProfileId && profileId === excludeProfileId) continue;

      const set = this.streams.get(profileId);
      if (!set) continue;

      for (const subject of set) {
        // data objet -> Nest fait le JSON.stringify côté SSE writer
        subject.next({ type, data: data as object });
      }
    }
  }

  // ==================== TYPING (depuis le controller REST) ====================

  /**
   * Diffuser un event de typing (start/stop) aux autres membres.
   * Le membership est validé par le controller avant l'appel.
   */
  async notifyTyping(
    conversationId: string,
    profileId: string,
    state: 'start' | 'stop',
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(
      memberIds,
      `typing:${state}`,
      { conversationId, profileId },
      profileId, // exclure l'auteur
    );
  }

  // ==================== NOTIFICATIONS MESSAGES (depuis le controller REST) ====================

  /** Nouveau message dans une conversation. */
  async notifyNewMessage(
    conversationId: string,
    message: unknown,
    excludeProfileId?: string,
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(
      memberIds,
      'message:new',
      { conversationId, message },
      excludeProfileId,
    );
    this.logger.log(`Notified new message in conversation ${conversationId}`);
  }

  /** Message marqué comme lu (read receipt). */
  async notifyMessageRead(
    conversationId: string,
    profileId: string,
    messageId?: string,
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(
      memberIds,
      'message:read',
      {
        conversationId,
        messageId,
        readBy: profileId,
        readAt: new Date(),
      },
      profileId, // exclure le lecteur
    );
  }

  /** Message modifié. */
  async notifyMessageEdited(
    conversationId: string,
    message: unknown,
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(memberIds, 'message:edited', { conversationId, message });
  }

  /** Message supprimé. */
  async notifyMessageDeleted(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(memberIds, 'message:deleted', {
      conversationId,
      messageId,
    });
  }

  /** Réaction ajoutée. */
  async notifyReactionAdded(
    conversationId: string,
    data: { messageId: string; emoji: string; profileId: string },
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(memberIds, 'reaction:added', { conversationId, ...data });
  }

  /** Réaction retirée. */
  async notifyReactionRemoved(
    conversationId: string,
    data: { messageId: string; emoji: string; profileId: string },
  ): Promise<void> {
    const memberIds =
      await this.messagingService.getConversationMemberIds(conversationId);
    this.emitToProfiles(memberIds, 'reaction:removed', {
      conversationId,
      ...data,
    });
  }

  // ==================== PRESENCE ====================

  /**
   * Notifier les contacts (relationship ACCEPTED uniquement) du changement de présence.
   */
  private async broadcastPresenceUpdate(
    profileId: string,
    status: 'online' | 'offline',
  ): Promise<void> {
    try {
      const connections =
        await this.profileConnectionService.getConnections(profileId);

      const connectedProfileIds = connections.map((conn) =>
        conn.requesterId === profileId ? conn.accepterId : conn.requesterId,
      );

      this.emitToProfiles(connectedProfileIds, 'presence:update', {
        profileId,
        status,
        timestamp: new Date(),
      });

      this.logger.log(
        `Presence ${status} for ${profileId} sent to ${connectedProfileIds.length} connections`,
      );
    } catch (error) {
      this.logger.error(`Error broadcasting presence: ${error.message}`);
    }
  }

  /** Savoir si un profil a au moins un stream ouvert. */
  isProfileOnline(profileId: string): boolean {
    return this.streams.has(profileId);
  }

  /** Liste des profils ayant un stream ouvert. */
  getOnlineProfiles(): string[] {
    return Array.from(this.streams.keys());
  }
}
