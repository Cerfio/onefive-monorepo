import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';
const SSE_URL = `${API_URL}/messaging/events`;

// ==================== TYPES ====================
// NOTE: les payloads SSE embarquent toujours conversationId pour permettre au
// client de filtrer (un seul stream global reçoit les events de TOUTES les
// conversations de l'utilisateur).

export interface WebSocketMessage {
  conversationId: string;
  message: {
    id: string;
    content: string | null;
    type: string;
    senderId: string;
    createdAt: string;
  };
}

export interface TypingEvent {
  conversationId: string;
  profileId: string; // NOTE: Utilise profileId, pas userId
}

export interface PresenceEvent {
  profileId: string; // NOTE: Utilise profileId, pas userId
  status: 'online' | 'offline';
  timestamp: string;
}

export interface MessageReadEvent {
  conversationId: string;
  messageId?: string;
  readBy: string; // profileId
  readAt: string;
}

export interface MessageEditedEvent {
  conversationId: string;
  message: {
    id: string;
    content: string;
    editedAt: string;
  };
}

export interface MessageDeletedEvent {
  conversationId: string;
  messageId: string;
}

export interface ReactionEvent {
  conversationId: string;
  messageId: string;
  emoji: string;
  profileId: string;
}

// ==================== SHARED SSE CONNECTION ====================

/**
 * Connexion SSE unique partagée par tous les hooks (refcount).
 *
 * Pourquoi un singleton : useWebSocket est appelé à plusieurs endroits
 * (page messages, useWebSocketMessages, useWebSocketPresence). Sans partage,
 * chaque appel ouvrirait son propre EventSource → 3 connexions par page et
 * 3× la présence. Ici, une seule connexion est ouverte tant qu'au moins un
 * consommateur est monté.
 *
 * EventSource gère nativement la reconnexion automatique. Le serveur envoie
 * des events typés (message:new, typing:start, presence:update…) + un `ping`
 * de keep-alive qu'on ignore.
 */
class SseConnection {
  private es: EventSource | null = null;
  private refCount = 0;
  private connected = false;
  private readonly listeners = new Map<string, Set<(data: unknown) => void>>();
  private readonly boundTypes = new Set<string>();
  private readonly connStateListeners = new Set<(connected: boolean) => void>();

  constructor(private readonly url: string) {}

  acquire() {
    this.refCount += 1;
    if (!this.es) this.connect();
  }

  release() {
    this.refCount -= 1;
    if (this.refCount <= 0) {
      this.refCount = 0;
      this.disconnect();
    }
  }

  private connect() {
    const es = new EventSource(this.url, { withCredentials: true });
    this.es = es;

    es.onopen = () => this.setConnected(true);
    // EventSource se reconnecte tout seul après une erreur réseau.
    es.onerror = () => this.setConnected(false);

    // Rebrancher les listeners natifs pour chaque type déjà souscrit.
    this.boundTypes.clear();
    for (const type of this.listeners.keys()) this.bindType(type);
  }

  private disconnect() {
    this.es?.close();
    this.es = null;
    this.boundTypes.clear();
    this.setConnected(false);
  }

  private bindType(type: string) {
    if (!this.es || this.boundTypes.has(type)) return;
    this.boundTypes.add(type);
    this.es.addEventListener(type, (ev: MessageEvent) => {
      const set = this.listeners.get(type);
      if (!set || set.size === 0) return;
      let data: unknown;
      try {
        data = ev.data ? JSON.parse(ev.data) : undefined;
      } catch {
        data = ev.data;
      }
      set.forEach((cb) => cb(data));
    });
  }

  on(type: string, callback: (data: unknown) => void): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(callback);
    this.bindType(type);
    return () => this.off(type, callback);
  }

  off(type: string, callback: (data: unknown) => void) {
    this.listeners.get(type)?.delete(callback);
  }

  onConnState(callback: (connected: boolean) => void): () => void {
    this.connStateListeners.add(callback);
    callback(this.connected);
    return () => this.connStateListeners.delete(callback);
  }

  private setConnected(value: boolean) {
    if (this.connected === value) return;
    this.connected = value;
    this.connStateListeners.forEach((cb) => cb(value));
  }
}

// Singleton module-level (une connexion pour toute l'app).
let connection: SseConnection | null = null;
const getConnection = (): SseConnection => {
  if (!connection) connection = new SseConnection(SSE_URL);
  return connection;
};

// ==================== TYPING (client -> server via REST) ====================

const sendTyping = (conversationId: string, state: 'start' | 'stop') => {
  // Fire-and-forget : un échec de typing ne doit jamais casser l'UI.
  void api
    .post('messaging/typing', { json: { conversationId, state } })
    .catch(() => {});
};

// ==================== HOOKS ====================

/**
 * Hook de connexion temps réel (SSE).
 *
 * ARCHITECTURE (REST + SSE):
 * - Messages: envoi via REST API, réception via SSE
 * - Typing: POST REST (éphémère)
 * - Présence: via SSE (online quand le stream est ouvert)
 * - Read receipts: REST API + notification SSE
 *
 * NOTE: le profileId est extrait du cookie côté serveur. Le paramètre profileId
 * sert juste à conditionner l'ouverture de la connexion (utilisateur connecté).
 *
 * joinConversation/leaveConversation sont conservés pour compat mais ne font
 * plus rien : le routing se fait désormais par membership côté serveur.
 */
export const useWebSocket = (profileId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    const conn = getConnection();
    conn.acquire();
    const unsubscribe = conn.onConnState(setIsConnected);

    return () => {
      unsubscribe();
      conn.release();
    };
  }, [profileId]);

  const joinConversation = useCallback((_conversationId: string) => {
    // No-op: le serveur route par membership (plus de rooms).
  }, []);

  const leaveConversation = useCallback((_conversationId: string) => {
    // No-op: voir joinConversation.
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    sendTyping(conversationId, 'start');
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    sendTyping(conversationId, 'stop');
  }, []);

  const on = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      return getConnection().on(event, callback as (data: unknown) => void);
    },
    [],
  );

  const off = useCallback((event: string, callback: (data: unknown) => void) => {
    getConnection().off(event, callback);
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    on,
    off,
  };
};

/**
 * Hook pour gérer les événements de messagerie en temps réel.
 *
 * - Écoute les nouveaux messages, read receipts, édits/suppressions, réactions
 * - Gère le typing indicator
 *
 * Filtre sur conversationId : la liste des conversations / unread est toujours
 * invalidée, mais les messages d'une conversation ne sont rafraîchis que si
 * l'event concerne bien la conversation ouverte.
 */
export const useWebSocketMessages = (
  conversationId: string | null,
  profileId: string | null,
) => {
  const queryClient = useQueryClient();
  const { on } = useWebSocket(profileId);
  const [typingProfiles, setTypingProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) return;

    const invalidateMessages = () =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

    const isForThisConversation = (cid: string | undefined) =>
      cid === conversationId;

    // Nouveaux messages : rafraîchir la liste des conversations + unread dans
    // tous les cas, et les messages seulement si c'est la conversation ouverte.
    const unsubscribeNewMessage = on<WebSocketMessage>('message:new', (data) => {
      if (isForThisConversation(data?.conversationId)) invalidateMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    const unsubscribeRead = on<MessageReadEvent>('message:read', (data) => {
      if (isForThisConversation(data?.conversationId)) invalidateMessages();
    });

    const unsubscribeEdited = on<MessageEditedEvent>('message:edited', (data) => {
      if (isForThisConversation(data?.conversationId)) invalidateMessages();
    });

    const unsubscribeDeleted = on<MessageDeletedEvent>(
      'message:deleted',
      (data) => {
        if (isForThisConversation(data?.conversationId)) invalidateMessages();
      },
    );

    const unsubscribeReactionAdded = on<ReactionEvent>('reaction:added', (data) => {
      if (isForThisConversation(data?.conversationId)) invalidateMessages();
    });

    const unsubscribeReactionRemoved = on<ReactionEvent>(
      'reaction:removed',
      (data) => {
        if (isForThisConversation(data?.conversationId)) invalidateMessages();
      },
    );

    // Typing start (seulement pour la conversation ouverte)
    const unsubscribeTypingStart = on<TypingEvent>('typing:start', (data) => {
      if (!isForThisConversation(data?.conversationId)) return;
      const typingProfileId = data.profileId;
      setTypingProfiles((prev) => new Set(prev).add(typingProfileId));

      // Auto-stop après 5s si pas de typing:stop reçu
      setTimeout(() => {
        setTypingProfiles((prev) => {
          const next = new Set(prev);
          next.delete(typingProfileId);
          return next;
        });
      }, 5000);
    });

    // Typing stop
    const unsubscribeTypingStop = on<TypingEvent>('typing:stop', (data) => {
      if (!isForThisConversation(data?.conversationId)) return;
      setTypingProfiles((prev) => {
        const next = new Set(prev);
        next.delete(data.profileId);
        return next;
      });
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeRead();
      unsubscribeEdited();
      unsubscribeDeleted();
      unsubscribeReactionAdded();
      unsubscribeReactionRemoved();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
    };
  }, [conversationId, on, queryClient]);

  return {
    isTyping: typingProfiles.size > 0,
    typingProfiles: Array.from(typingProfiles),
  };
};

/**
 * Hook pour gérer la présence utilisateur (online/offline).
 *
 * NOTE: La présence est uniquement visible pour les profils avec lesquels on a
 * une relationship ACCEPTED (filtrage côté serveur).
 */
export const useWebSocketPresence = (profileId: string | null) => {
  const { on } = useWebSocket(profileId);
  const [onlineProfiles, setOnlineProfiles] = useState<Set<string>>(new Set());

  // Snapshot initial : les events presence:update ne portent que les
  // changements postérieurs à l'ouverture du stream ; sans snapshot, un contact
  // déjà en ligne resterait affiché « Hors ligne ». On amorce donc l'état.
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await api.get('messaging/presence');
        const json = (await res.json()) as {
          success: boolean;
          data?: { online?: string[] };
        };
        if (cancelled || !json.success) return;
        const online = json.data?.online ?? [];
        setOnlineProfiles((prev) => {
          const next = new Set(prev);
          online.forEach((id) => next.add(id));
          return next;
        });
      } catch {
        // Présence best-effort : un échec ne doit pas casser la messagerie.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    const unsubscribe = on<PresenceEvent>('presence:update', (data) => {
      setOnlineProfiles((prev) => {
        const next = new Set(prev);
        if (data.status === 'online') {
          next.add(data.profileId);
        } else {
          next.delete(data.profileId);
        }
        return next;
      });
    });

    return unsubscribe;
  }, [on]);

  const isOnline = useCallback(
    (checkProfileId: string) => onlineProfiles.has(checkProfileId),
    [onlineProfiles],
  );

  return {
    isOnline,
    onlineProfiles: Array.from(onlineProfiles),
  };
};
