import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface LastMessage {
  id: string;
  content: string | null;
  type: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string;
  participants: ConversationParticipant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface MessageSender {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isMe: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  id: string;
  type: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface MessageReplyTo {
  id: string;
  content: string | null;
  senderName: string;
}

export interface Message {
  id: string;
  content: string | null;
  type: string;
  status: string;
  createdAt: string;
  editedAt: string | null;
  sender: MessageSender;
  replyTo: MessageReplyTo | null;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  isRead: boolean;
  readCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Backend utilise PaginatedResponseDto (items) et CursorPaginatedResponseDto (items)
interface ConversationsApiResponse {
  items?: Conversation[];
  conversations?: Conversation[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore: boolean;
}

interface MessagesApiResponse {
  items?: Message[];
  messages?: Message[];
  hasMore: boolean;
  nextCursor?: string | null;
}

// ==================== QUERIES ====================

export const useConversations = (search?: string) => {
  return useQuery({
    queryKey: ['conversations', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get(`messaging/conversations?${params}`);
      const result = await response.json() as ApiResponse<ConversationsApiResponse>;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch conversations');
      }
      
      const data = result.data;
      return {
        conversations: data.items ?? data.conversations ?? [],
        total: data.total ?? 0,
        hasMore: data.hasMore ?? false,
      };
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useMessages = (conversationId: string | null) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam = null }) => {
      if (!conversationId) return { messages: [], hasMore: false, nextCursor: null };
      
      const params = new URLSearchParams();
      params.append('limit', '50');
      if (pageParam) {
        params.append('cursor', pageParam);
        params.append('direction', 'before');
      }
      
      const response = await api.get(`messaging/conversations/${conversationId}/messages?${params}`);
      const result = await response.json() as ApiResponse<MessagesApiResponse>;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      
      const data = result.data;
      return {
        messages: data.items ?? data.messages ?? [],
        hasMore: data.hasMore ?? false,
        nextCursor: data.nextCursor ?? null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!conversationId,
    staleTime: 10000, // 10 seconds
  });
};

// ==================== MUTATIONS ====================

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      participantIds: string[];
      name?: string;
      type?: 'DIRECT' | 'GROUP';
      initialMessage?: string;
    }) => {
      const response = await api.post('messaging/conversations', {
        json: data,
      });
      const result = await response.json() as ApiResponse<Conversation & { isExisting: boolean }>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to create conversation');
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Pré-remplir le cache pour que la conversation soit visible immédiatement à la navigation
      const { isExisting: _, ...conversation } = data;
      const conversationToAdd = conversation as Conversation;
      queryClient.setQueriesData<{ conversations: Conversation[]; total: number; hasMore: boolean }>(
        { queryKey: ['conversations'] },
        (old) => {
          if (!old) {
            return { conversations: [conversationToAdd], total: 1, hasMore: false };
          }
          const exists = old.conversations?.some((c) => c.id === data.id);
          if (exists) return old;
          return {
            ...old,
            conversations: [conversationToAdd, ...(old.conversations || [])],
            total: (old.total ?? 0) + 1,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (data.isExisting) {
        toast.info('Conversation existante ouverte');
      } else {
        toast.success('Conversation créée');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

/**
 * Hook pour envoyer un message avec optimistic update
 * 
 * Flow:
 * 1. Le message apparaît immédiatement avec status 'SENDING'
 * 2. REST API envoie au backend
 * 3. Si succès: message confirmé, status 'SENT'
 * 4. Si erreur: rollback, message disparaît, toast d'erreur
 * 5. Le backend notifie les autres participants via SSE
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      content?: string;
      type?: string;
      replyToId?: string;
      attachmentId?: string;
      // Pour l'optimistic update
      _optimistic?: {
        tempId: string;
        sender: MessageSender;
        attachments?: MessageAttachment[];
      };
    }) => {
      const { _optimistic, ...sendData } = data;
      
      const response = await api.post('messaging/messages', {
        json: sendData,
      });
      const result = await response.json() as ApiResponse<Message>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      return result.data;
    },
    
    // ✅ Optimistic Update: Ajouter le message immédiatement
    onMutate: async (variables) => {
      // Annuler les refetch en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['messages', variables.conversationId] });
      
      // Sauvegarder l'état précédent pour rollback
      const previousMessages = queryClient.getQueryData(['messages', variables.conversationId]);
      
      // Créer le message optimistic
      if (variables._optimistic) {
        const optimisticMessage: Message = {
          id: variables._optimistic.tempId,
          content: variables.content || null,
          type: variables.type || 'TEXT',
          status: 'SENDING', // Statut temporaire
          createdAt: new Date().toISOString(),
          editedAt: null,
          sender: variables._optimistic.sender,
          replyTo: null,
          attachments: variables._optimistic.attachments ?? [],
          reactions: [],
          isRead: false,
          readCount: 0,
        };

        // Ajouter le message optimistic à la liste
        queryClient.setQueryData<{
          pages: { messages: Message[]; hasMore: boolean; nextCursor: string | null }[];
          pageParams: (string | undefined)[];
        } | undefined>(
          ['messages', variables.conversationId],
          (old) => {
            if (!old) return old;
            
            return {
              ...old,
              pages: old.pages.map((page, index) => 
                index === 0
                  ? { ...page, messages: [optimisticMessage, ...page.messages] }
                  : page
              ),
            };
          }
        );
      }

      return { previousMessages };
    },
    
    // ✅ Succès: Remplacer le message optimistic par le vrai
    onSuccess: (newMessage, variables) => {
      if (variables._optimistic) {
        // Remplacer le message temporaire par le vrai message
        queryClient.setQueryData<{
          pages: { messages: Message[]; hasMore: boolean; nextCursor: string | null }[];
          pageParams: (string | undefined)[];
        } | undefined>(
          ['messages', variables.conversationId],
          (old) => {
            if (!old) return old;
            
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                messages: page.messages.map((msg) =>
                  msg.id === variables._optimistic?.tempId ? newMessage : msg
                ),
              })),
            };
          }
        );
      } else {
        // Sans optimistic, juste invalider
        queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      }
      
      // Mettre à jour la liste des conversations (ordre, dernier message)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    
    // ❌ Erreur: Rollback au state précédent
    onError: (error: Error, variables, context) => {
      // Rollback
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', variables.conversationId],
          context.previousMessages
        );
      }
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

/**
 * Résultat d'un upload de pièce jointe : l'`id` (File) sert d'`attachmentId`
 * pour POST /messages, les autres champs alimentent l'aperçu optimiste.
 */
export interface UploadedAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'IMAGE' | 'FILE';
}

/**
 * Uploade une pièce jointe (image ou document, ≤10 Mo) AVANT l'envoi du message.
 * Le fichier est stocké + une ligne File créée côté serveur ; on récupère l'id.
 */
export const useUploadMessageAttachment = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadedAttachment> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('messaging/attachments/upload', {
        body: formData,
      });
      const result = (await response.json()) as ApiResponse<UploadedAttachment>;

      if (!result.success) {
        throw new Error(result.error || "Échec de l'upload");
      }

      return result.data;
    },
    onError: (error: Error) => {
      toast.error(`Pièce jointe : ${error.message}`);
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      content: string;
      conversationId: string;
    }) => {
      const response = await api.put(`messaging/messages/${data.messageId}`, {
        json: { content: data.content },
      });
      const result = await response.json() as ApiResponse<Message>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to edit message');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      toast.success('Message modifié');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; conversationId: string }) => {
      const response = await api.delete(`messaging/messages/${data.messageId}`);
      const result = await response.json() as ApiResponse<{ success: boolean }>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete message');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; messageId?: string }) => {
      const response = await api.post(`messaging/conversations/${data.conversationId}/read`, {
        json: data.messageId ? { messageId: data.messageId } : {},
      });
      const result = await response.json() as ApiResponse<{ markedAsRead: number }>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark as read');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      emoji: string;
      conversationId: string;
    }) => {
      const response = await api.post(`messaging/messages/${data.messageId}/reactions`, {
        json: { messageId: data.messageId, emoji: data.emoji },
      });
      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to add reaction');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      emoji: string;
      conversationId: string;
    }) => {
      const response = await api.delete(
        `messaging/messages/${data.messageId}/reactions/${encodeURIComponent(data.emoji)}`
      );
      const result = await response.json() as ApiResponse<{ success: boolean }>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove reaction');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
};

// ==================== UTILITY HOOKS ====================

export const useUnreadCount = () => {
  const { data } = useConversations();
  const conversations = data?.conversations ?? [];
  return conversations.reduce((total, conv) => total + (conv.unreadCount ?? 0), 0);
};
