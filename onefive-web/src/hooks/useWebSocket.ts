import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:50050';

export interface WebSocketMessage {
  id: string;
  conversationId: string;
  content: string | null;
  type: string;
  senderId: string;
  createdAt: string;
}

export interface TypingEvent {
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
  id: string;
  conversationId: string;
  content: string;
  editedAt: string;
}

export interface MessageDeletedEvent {
  messageId: string;
}

export interface ReactionEvent {
  messageId: string;
  emoji: string;
  profileId: string;
}

/**
 * Hook pour gérer la connexion WebSocket
 * 
 * ARCHITECTURE (Approche 1 - REST + WS notification):
 * - Messages: Envoi via REST API, réception via WebSocket
 * - Typing: Via WebSocket (éphémère)
 * - Présence: Via WebSocket (seulement si relationship)
 * - Read receipts: Via REST API + notification WebSocket
 * 
 * NOTE: Le profileId est automatiquement extrait du cookie côté serveur
 */
export const useWebSocket = (profileId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connexion WebSocket
  useEffect(() => {
    if (!profileId) return;

    // Créer la connexion
    // NOTE: Le cookie de session est automatiquement envoyé avec withCredentials: true
    const socket = io(`${WS_URL}/messaging`, {
      withCredentials: true, // ✅ Envoie automatiquement les cookies
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Event: Connexion établie
    socket.on('connect', () => {
      setIsConnected(true);
    });

    // Event: Déconnexion
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Event: Erreur de connexion
    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Event: Confirmation de présence
    socket.on('presence:connected', (_data: { profileId: string; status: string }) => {
    });

    // Heartbeat pour maintenir la connexion active
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('presence:heartbeat');
      }
    }, 30000); // Toutes les 30 secondes

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [profileId]);

  // Joindre une conversation (pour recevoir les events de cette conversation)
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:join', { conversationId });
    }
  }, []);

  // Quitter une conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:leave', { conversationId });
    }
  }, []);

  // Typing indicators (via WebSocket car éphémère)
  // NOTE: Pas besoin d'envoyer le profileId - extrait du cookie côté serveur
  const startTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { conversationId });
    }
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { conversationId });
    }
  }, []);

  // Écouter les events
  const on = useCallback(
    <T = any>(event: string, callback: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
        return () => {
          socketRef.current?.off(event, callback);
        };
      }
      return () => {};
    },
    [],
  );

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinConversation,
    leaveConversation,
    // ❌ sendMessage et markAsRead SUPPRIMÉS - utiliser REST API à la place
    startTyping,
    stopTyping,
    on,
    off,
  };
};

/**
 * Hook pour gérer les événements de messagerie en temps réel
 * 
 * - Écoute les nouveaux messages (envoyés par d'autres via REST, notifiés via WS)
 * - Écoute les read receipts
 * - Écoute les messages édités/supprimés
 * - Gère le typing indicator
 */
export const useWebSocketMessages = (conversationId: string | null, profileId: string | null) => {
  const queryClient = useQueryClient();
  const { on, joinConversation, leaveConversation } = useWebSocket(profileId);
  const [typingProfiles, setTypingProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) return;

    // Joindre la conversation pour recevoir les événements
    joinConversation(conversationId);

    // Écouter les nouveaux messages (envoyés par les autres via REST)
    const unsubscribeNewMessage = on<WebSocketMessage>('message:new', (_message) => {
      // Invalider les queries pour rafraîchir la liste des messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Aussi mettre à jour le compteur de messages non lus
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    // Écouter les messages lus (read receipts)
    const unsubscribeRead = on<MessageReadEvent>('message:read', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    // Écouter les messages édités
    const unsubscribeEdited = on<MessageEditedEvent>('message:edited', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    // Écouter les messages supprimés
    const unsubscribeDeleted = on<MessageDeletedEvent>('message:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    // Écouter les réactions ajoutées
    const unsubscribeReactionAdded = on<ReactionEvent>('reaction:added', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    // Écouter les réactions retirées
    const unsubscribeReactionRemoved = on<ReactionEvent>('reaction:removed', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    // Écouter typing start
    const unsubscribeTypingStart = on<TypingEvent>('typing:start', ({ profileId: typingProfileId }) => {
      setTypingProfiles((prev) => new Set(prev).add(typingProfileId));
      
      // Auto-stop après 5 secondes si pas de typing:stop reçu
      setTimeout(() => {
        setTypingProfiles((prev) => {
          const next = new Set(prev);
          next.delete(typingProfileId);
          return next;
        });
      }, 5000);
    });

    // Écouter typing stop
    const unsubscribeTypingStop = on<TypingEvent>('typing:stop', ({ profileId: typingProfileId }) => {
      setTypingProfiles((prev) => {
        const next = new Set(prev);
        next.delete(typingProfileId);
        return next;
      });
    });

    // Cleanup
    return () => {
      leaveConversation(conversationId);
      unsubscribeNewMessage();
      unsubscribeRead();
      unsubscribeEdited();
      unsubscribeDeleted();
      unsubscribeReactionAdded();
      unsubscribeReactionRemoved();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
    };
  }, [conversationId, profileId, on, joinConversation, leaveConversation, queryClient]);

  return {
    isTyping: typingProfiles.size > 0,
    typingProfiles: Array.from(typingProfiles),
  };
};

/**
 * Hook pour gérer la présence utilisateur (online/offline)
 * 
 * NOTE: La présence est uniquement visible pour les profils
 * avec lesquels on a une relationship ACCEPTED
 */
export const useWebSocketPresence = (profileId: string | null) => {
  const { on } = useWebSocket(profileId);
  const [onlineProfiles, setOnlineProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Écouter les changements de présence (seulement des contacts en relationship)
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
    (checkProfileId: string) => {
      return onlineProfiles.has(checkProfileId);
    },
    [onlineProfiles],
  );

  return {
    isOnline,
    onlineProfiles: Array.from(onlineProfiles),
  };
};
