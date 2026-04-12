import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { SessionsService } from '../sessions/sessions.service';
import { ProfileConnectionService } from '../profile-connection/profile-connection.service';

// Interface pour stocker les connexions actives
// NOTE: On utilise profileId et non userId pour éviter l'exposition
interface ConnectedClient {
  profileId: string;
  socketId: string;
  lastSeen: Date;
}

// Interface pour le rate limiting
interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

// Configuration du rate limiting
const RATE_LIMIT_CONFIG = {
  typing: { maxRequests: 10, windowMs: 5000 }, // 10 typing events par 5 secondes
  conversation: { maxRequests: 20, windowMs: 10000 }, // 20 join/leave par 10 secondes
  heartbeat: { maxRequests: 5, windowMs: 30000 }, // 5 heartbeats par 30 secondes
};

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  // Map profileId -> socketId pour tracking des connexions
  private connectedClients: Map<string, ConnectedClient> = new Map();

  // Map conversationId -> Set<profileId> pour tracking des participants
  private conversationParticipants: Map<string, Set<string>> = new Map();

  // Rate limiting: Map<profileId:eventType, RateLimitEntry>
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly sessionsService: SessionsService,
    private readonly profileConnectionService: ProfileConnectionService,
  ) {}

  /**
   * Vérifier le rate limit pour un profileId et un type d'événement
   * @returns true si la requête est autorisée, false si rate limited
   */
  private checkRateLimit(
    profileId: string,
    eventType: keyof typeof RATE_LIMIT_CONFIG,
  ): boolean {
    const key = `${profileId}:${eventType}`;
    const config = RATE_LIMIT_CONFIG[eventType];
    const now = new Date();

    const entry = this.rateLimitMap.get(key);

    if (!entry || now >= entry.resetAt) {
      // Nouvelle fenêtre ou première requête
      this.rateLimitMap.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${profileId} on ${eventType}`);
      return false;
    }

    entry.count++;
    return true;
  }

  // ==================== LIFECYCLE ====================

  async handleConnection(client: Socket) {
    try {
      // Extraire le profileId depuis l'auth token
      const profileId = await this.extractProfileIdFromSocket(client);

      if (!profileId) {
        this.logger.warn(`Connection refused: No valid profileId`);
        client.disconnect();
        return;
      }

      // Enregistrer le client
      this.connectedClients.set(profileId, {
        profileId,
        socketId: client.id,
        lastSeen: new Date(),
      });

      this.logger.log(
        `Client connected: profileId=${profileId}, socketId=${client.id}`,
      );

      // Notifier les conversations du statut online
      await this.broadcastPresenceUpdate(profileId, 'online');

      // Envoyer au client son propre statut
      client.emit('presence:connected', { profileId, status: 'online' });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const profileId = await this.extractProfileIdFromSocket(client);

      if (profileId) {
        this.connectedClients.delete(profileId);

        // Retirer des conversations
        this.conversationParticipants.forEach((participants) => {
          participants.delete(profileId);
        });

        // Notifier les conversations du statut offline
        await this.broadcastPresenceUpdate(profileId, 'offline');

        this.logger.log(`Client disconnected: profileId=${profileId}`);
      }
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  // ==================== PUBLIC NOTIFICATION METHODS (appelées par Controller REST) ====================

  /**
   * Notifier les participants d'un nouveau message
   * Appelée depuis MessagingController après sauvegarde en DB
   */
  public async notifyNewMessage(
    conversationId: string,
    message: any,
    excludeProfileId?: string,
  ) {
    await this.broadcastToConversation(
      conversationId,
      'message:new',
      message,
      excludeProfileId,
    );
    this.logger.log(`Notified new message in conversation ${conversationId}`);
  }

  /**
   * Notifier les participants qu'un message a été lu
   * Appelée depuis MessagingController après markAsRead en DB
   */
  public async notifyMessageRead(
    conversationId: string,
    profileId: string,
    messageId?: string,
  ) {
    await this.broadcastToConversation(
      conversationId,
      'message:read',
      {
        conversationId,
        messageId,
        readBy: profileId,
        readAt: new Date(),
      },
      profileId, // Exclure le lecteur
    );
  }

  /**
   * Notifier les participants qu'un message a été modifié
   */
  public async notifyMessageEdited(conversationId: string, message: any) {
    await this.broadcastToConversation(
      conversationId,
      'message:edited',
      message,
    );
  }

  /**
   * Notifier les participants qu'un message a été supprimé
   */
  public async notifyMessageDeleted(conversationId: string, messageId: string) {
    await this.broadcastToConversation(conversationId, 'message:deleted', {
      messageId,
    });
  }

  /**
   * Notifier les participants qu'une réaction a été ajoutée
   */
  public async notifyReactionAdded(
    conversationId: string,
    data: { messageId: string; emoji: string; profileId: string },
  ) {
    await this.broadcastToConversation(conversationId, 'reaction:added', data);
  }

  /**
   * Notifier les participants qu'une réaction a été retirée
   */
  public async notifyReactionRemoved(
    conversationId: string,
    data: { messageId: string; emoji: string; profileId: string },
  ) {
    await this.broadcastToConversation(
      conversationId,
      'reaction:removed',
      data,
    );
  }

  // ==================== TYPING INDICATOR ====================

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      // ✅ Extraire le profileId depuis le cookie (pas depuis le client!)
      const profileId = await this.extractProfileIdFromSocket(client);
      if (!profileId) return;

      // ✅ Rate limiting
      if (!this.checkRateLimit(profileId, 'typing')) {
        return; // Silently ignore if rate limited
      }

      // ✅ Vérifier le membership (defense-in-depth)
      const isMember = await this.messagingService.isConversationMember(
        data.conversationId,
        profileId,
      );
      if (!isMember) return;

      // Broadcast aux autres participants avec le profileId validé
      await this.broadcastToConversation(
        data.conversationId,
        'typing:start',
        { profileId }, // ✅ profileId validé par le backend
        profileId, // Exclure l'auteur
      );
    } catch (error) {
      this.logger.error(`Error handling typing start: ${error.message}`);
    }
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const profileId = await this.extractProfileIdFromSocket(client);
      if (!profileId) return;

      // ✅ Rate limiting
      if (!this.checkRateLimit(profileId, 'typing')) {
        return;
      }

      // ✅ Vérifier le membership (defense-in-depth)
      const isMember = await this.messagingService.isConversationMember(
        data.conversationId,
        profileId,
      );
      if (!isMember) return;

      // Broadcast aux autres participants
      await this.broadcastToConversation(
        data.conversationId,
        'typing:stop',
        { profileId },
        profileId, // Exclure l'auteur
      );
    } catch (error) {
      this.logger.error(`Error handling typing stop: ${error.message}`);
    }
  }

  // ==================== PRESENCE / STATUS ====================

  @SubscribeMessage('presence:heartbeat')
  async handlePresenceHeartbeat(@ConnectedSocket() client: Socket) {
    try {
      const profileId = await this.extractProfileIdFromSocket(client);
      if (!profileId) return;

      // ✅ Rate limiting
      if (!this.checkRateLimit(profileId, 'heartbeat')) {
        return;
      }

      const connectedClient = this.connectedClients.get(profileId);
      if (connectedClient) {
        connectedClient.lastSeen = new Date();
      }

      client.emit('presence:ack', { timestamp: new Date() });
    } catch (error) {
      this.logger.error(`Error handling heartbeat: ${error.message}`);
    }
  }

  @SubscribeMessage('conversation:join')
  async handleConversationJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const profileId = await this.extractProfileIdFromSocket(client);
      if (!profileId) return;

      // ✅ Rate limiting
      if (!this.checkRateLimit(profileId, 'conversation')) {
        return;
      }

      // ✅ Vérifier que le profil est bien membre de la conversation
      const isMember = await this.messagingService.isConversationMember(
        data.conversationId,
        profileId,
      );
      if (!isMember) {
        this.logger.warn(
          `Unauthorized conversation join attempt: profileId=${profileId}, conversationId=${data.conversationId}`,
        );
        client.emit('error', {
          event: 'conversation:join',
          message: 'Not a member of this conversation',
        });
        return;
      }

      // Ajouter le profileId aux participants de cette conversation
      if (!this.conversationParticipants.has(data.conversationId)) {
        this.conversationParticipants.set(data.conversationId, new Set());
      }
      this.conversationParticipants.get(data.conversationId)!.add(profileId);

      // Joindre la room Socket.IO
      client.join(`conversation:${data.conversationId}`);

      this.logger.log(
        `Profile ${profileId} joined conversation ${data.conversationId}`,
      );
    } catch (error) {
      this.logger.error(`Error joining conversation: ${error.message}`);
    }
  }

  @SubscribeMessage('conversation:leave')
  async handleConversationLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const profileId = await this.extractProfileIdFromSocket(client);
      if (!profileId) return;

      // ✅ Rate limiting
      if (!this.checkRateLimit(profileId, 'conversation')) {
        return;
      }

      // Retirer le profileId des participants
      this.conversationParticipants.get(data.conversationId)?.delete(profileId);

      // Quitter la room Socket.IO
      client.leave(`conversation:${data.conversationId}`);

      this.logger.log(
        `Profile ${profileId} left conversation ${data.conversationId}`,
      );
    } catch (error) {
      this.logger.error(`Error leaving conversation: ${error.message}`);
    }
  }

  // ==================== HELPERS ====================

  /**
   * Extraire le profileId depuis le socket (authentification)
   * NOTE: Utilise le système de sessions existant (cookie token)
   * Retourne profileId et non userId pour éviter l'exposition
   */
  private async extractProfileIdFromSocket(
    client: Socket,
  ): Promise<string | null> {
    try {
      // Extraire le token depuis le cookie (comme SessionGuard)
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) {
        this.logger.warn('No cookie header in WebSocket handshake');
        return null;
      }

      // Parser le token depuis le cookie
      const tokenPrefix = 'token=';
      const cookieArray = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim());
      const fullToken = cookieArray.find((cookie) =>
        cookie.startsWith(tokenPrefix),
      );

      if (!fullToken) {
        this.logger.warn('Token not found in cookie');
        return null;
      }

      const sessionId = fullToken.substring(tokenPrefix.length);
      if (!sessionId) {
        this.logger.warn('Empty session token');
        return null;
      }

      // Valider la session et récupérer le profileId via SessionsService
      // NOTE: On retourne profileId, pas userId pour la sécurité
      const profileId =
        await this.sessionsService.getProfileIdFromSession(sessionId);

      if (!profileId) {
        this.logger.warn('Invalid session or no profile found');
        return null;
      }

      return profileId; // ✅ Retourne profileId, pas userId
    } catch (error) {
      this.logger.error(`Error extracting profileId: ${error.message}`);
      return null;
    }
  }

  /**
   * Broadcast un event à tous les participants d'une conversation
   */
  private async broadcastToConversation(
    conversationId: string,
    event: string,
    data: any,
    excludeProfileId?: string,
  ) {
    try {
      const participants = this.conversationParticipants.get(conversationId);
      if (!participants) return;

      for (const profileId of participants) {
        // Exclure un profileId spécifique si demandé
        if (excludeProfileId && profileId === excludeProfileId) {
          continue;
        }

        const client = this.connectedClients.get(profileId);
        if (client) {
          this.server.to(client.socketId).emit(event, data);
        }
      }
    } catch (error) {
      this.logger.error(`Error broadcasting to conversation: ${error.message}`);
    }
  }

  /**
   * Notifier les contacts du changement de présence
   * NOTE: Seulement les profils en relationship (ACCEPTED) reçoivent la notification
   */
  private async broadcastPresenceUpdate(
    profileId: string,
    status: 'online' | 'offline',
  ) {
    try {
      // ✅ Récupérer uniquement les profils en relationship ACCEPTED
      const connections =
        await this.profileConnectionService.getConnections(profileId);

      // Extraire les profileIds des connections (l'autre côté de la relation)
      const connectedProfileIds = connections.map((conn) =>
        conn.requesterId === profileId ? conn.accepterId : conn.requesterId,
      );

      // Notifier uniquement les profils connectés qui sont online
      for (const connectedProfileId of connectedProfileIds) {
        const client = this.connectedClients.get(connectedProfileId);
        if (client) {
          this.server.to(client.socketId).emit('presence:update', {
            profileId,
            status,
            timestamp: new Date(),
          });
        }
      }

      this.logger.log(
        `Presence ${status} for ${profileId} sent to ${connectedProfileIds.length} connections`,
      );
    } catch (error) {
      this.logger.error(`Error broadcasting presence: ${error.message}`);
    }
  }

  /**
   * Obtenir le statut online d'un profile
   */
  public isProfileOnline(profileId: string): boolean {
    return this.connectedClients.has(profileId);
  }

  /**
   * Obtenir tous les profiles online
   */
  public getOnlineProfiles(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
