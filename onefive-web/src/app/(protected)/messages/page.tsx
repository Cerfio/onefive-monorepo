'use client';

import { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import hotkeys from 'hotkeys-js';
import { useTranslations } from 'next-intl';
import {
  MessageChatCircle,
  SearchLg,
  Send01,
  X,
  RefreshCw01,
  ArrowLeft,
  Paperclip,
  File02,
  InfoCircle,
} from '@untitledui/icons';
import { ListBox, ListBoxItem, type ListBoxItemProps } from 'react-aria-components';
import { ContentDivider } from '@/components/content-divider/content-divider';
import { MessageItem } from '@/components/messaging';
import { Avatar } from '@/components/base/avatar/avatar';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Form } from '@/components/base/form/form';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { cn } from '@/lib/utils';
import Navbar from '@/components/navbar';
import { toast } from 'sonner';
import { CreateConversationModal } from '@/components/messages/CreateConversationModal';
import { ConfirmModal } from '@/components/startup/modals/ConfirmModal';
import { ConversationContextPanel } from '@/components/messaging/ConversationContextPanel';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useUploadMessageAttachment,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useAddReaction,
  type Conversation,
  type Message,
  type UploadedAttachment,
} from '@/hooks/useMessaging';
import { useWebSocketMessages, useWebSocket, useWebSocketPresence } from '@/hooks/useWebSocket';
import { useMe } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

// ==================== COMPONENTS ====================

const ConversationListItem = ({
  value,
  className,
  ...otherProps
}: ListBoxItemProps<Conversation>) => {
  if (!value) return null;

  const participant = value.participants[0];
  const displayName =
    value.type === 'GROUP'
      ? value.name
      : participant
        ? `${participant.firstName} ${participant.lastName}`
        : 'Unknown';

  const lastMessagePreview = value.lastMessage?.content || 'Aucun message';

  return (
    <ListBoxItem
      textValue={displayName}
      {...otherProps}
      className={state =>
        cn(
          'relative flex justify-between gap-4 border-b border-secondary py-3 pr-4 pl-3 select-none cursor-pointer hover:bg-secondary_subtle transition-colors',
          state.isFocused && 'outline-2 -outline-offset-2 outline-focus-ring',
          state.isSelected && 'bg-secondary_subtle',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      <div className="flex items-center min-w-0">
        <div className="flex h-full w-5 items-center flex-shrink-0">
          {value.unreadCount > 0 && (
            <span className="size-2 rounded-full bg-fg-brand-secondary" />
          )}
        </div>
        <AvatarLabelGroup
          size="md"
          src={participant?.avatarUrl ?? undefined}
          alt={displayName}
          firstName={participant?.firstName}
          lastName={participant?.lastName}
          title={displayName}
          subtitle={
            lastMessagePreview.length > 50
              ? lastMessagePreview.slice(0, 50) + '…'
              : lastMessagePreview
          }
        />
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-tertiary">
          {new Date(value.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {value.unreadCount > 0 && (
          <Badge size="sm" type="pill-color" color="brand">
            {value.unreadCount}
          </Badge>
        )}
      </div>
    </ListBoxItem>
  );
};

// Taille lisible pour l'aperçu des pièces jointes.
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

// Extension (pour l'icône du composant) depuis le nom dérivé côté serveur.
const extFromName = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : 'file';
};

const MessageSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-10 h-10 bg-secondary rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-secondary rounded w-24" />
      <div className="h-16 bg-secondary rounded-lg w-3/4" />
    </div>
  </div>
);

const ConversationSkeleton = () => (
  <div className="flex gap-4 border-b border-secondary py-3 pr-4 pl-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-secondary rounded-full" />
      <div className="space-y-2">
        <div className="h-4 bg-secondary rounded w-32" />
        <div className="h-3 bg-secondary rounded w-48" />
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

const MessagesPage = () => {
  const _t = useTranslations('messages');
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: me } = useMe();

  // State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<UploadedAttachment | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showContextPanel, setShowContextPanel] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLUListElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserNearBottom = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLLIElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unreadCountOnSelect = useRef(0);

  // API Hooks
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useConversations(searchQuery || undefined);

  // WebSocket hooks
  const { startTyping, stopTyping } = useWebSocket(me?.id ?? null);
  const { isTyping: isOtherTyping, typingProfiles } = useWebSocketMessages(
    selectedConversationId,
    me?.id ?? null,
  );
  const { isOnline } = useWebSocketPresence(me?.id ?? null);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(selectedConversationId);

  const sendMessage = useSendMessage();
  const uploadAttachment = useUploadMessageAttachment();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markAsRead = useMarkAsRead();
  const addReaction = useAddReaction();

  // Derived data
  const conversations = conversationsData?.conversations ?? [];

  // Onglets d'inbox : Tous / Non lus / Demandes (conversations avec un membre
  // hors de mes connexions). Le set des ids connectés vient de mes relations.
  const [inboxTab, setInboxTab] = useState<'all' | 'unread' | 'requests'>('all');

  const { data: myConnectionRels } = useQuery({
    queryKey: ['my-connection-ids'],
    queryFn: async () => {
      const res = await api.get('profiles/connections');
      const json = (await res.json()) as {
        data: Array<{ requesterId: string; accepterId: string }>;
      };
      return json.data;
    },
    enabled: !!me?.id,
    staleTime: 1000 * 60 * 5,
  });

  const connectedIdSet = useMemo(() => {
    const set = new Set<string>();
    (myConnectionRels ?? []).forEach((r) => {
      set.add(r.requesterId === me?.id ? r.accepterId : r.requesterId);
    });
    return set;
  }, [myConnectionRels, me?.id]);

  const isRequestConversation = useCallback(
    (conv: Conversation) => {
      if (conv.type !== 'DIRECT') return false;
      const other = conv.participants.find((p) => p.id !== me?.id);
      return !!other && !connectedIdSet.has(other.id);
    },
    [connectedIdSet, me?.id],
  );

  const unreadTabCount = useMemo(
    () => conversations.filter((c) => c.unreadCount > 0).length,
    [conversations],
  );
  const requestsTabCount = useMemo(
    () => conversations.filter(isRequestConversation).length,
    [conversations, isRequestConversation],
  );

  const visibleConversations = useMemo(() => {
    if (inboxTab === 'unread') return conversations.filter((c) => c.unreadCount > 0);
    if (inboxTab === 'requests') return conversations.filter(isRequestConversation);
    return conversations;
  }, [conversations, inboxTab, isRequestConversation]);
  const allMessages = useMemo(() => {
    return messagesData?.pages.flatMap((page: any) => page.messages) ?? [];
  }, [messagesData]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };
    handleViewportChange(mediaQuery);
    const listener = (event: MediaQueryListEvent) => handleViewportChange(event);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (isDesktop && conversations.length > 0 && !selectedConversationId) {
      const first = conversations[0];
      unreadCountOnSelect.current = first.unreadCount;
      setSelectedConversationId(first.id);
    }
  }, [conversations, isDesktop, selectedConversationId]);

  useEffect(() => {
    const conversationIdParam = searchParams.get('conversationId');
    if (!conversationIdParam) return;

    setSelectedConversationId(conversationIdParam);
    refetchConversations().then(() => {
      router.replace('/messages', { scroll: false });
    });
  }, [searchParams, refetchConversations, router]);

  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount) {
      markAsRead.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  useEffect(() => {
    if (isUserNearBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length]);

  useEffect(() => {
    hotkeys('ctrl+k, command+k', event => {
      event.preventDefault();
      const searchInput = document.querySelector(
        'input[placeholder*="Rechercher"]',
      ) as HTMLInputElement;
      searchInput?.focus();
    });
    return () => hotkeys.unbind('ctrl+k, command+k');
  }, []);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ==================== HANDLERS ====================

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 150;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    isUserNearBottom.current = nearBottom;
    setShowScrollButton(!nearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      const hasText = message.trim().length > 0;
      // On peut envoyer soit du texte, soit une pièce jointe (avec texte optionnel).
      if ((!hasText && !pendingAttachment) || !selectedConversationId || !me) return;

      stopTyping(selectedConversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      sendMessage.mutate({
        conversationId: selectedConversationId,
        content: hasText ? message : undefined,
        type: pendingAttachment ? pendingAttachment.type : 'TEXT',
        attachmentId: pendingAttachment?.id,
        replyToId: replyingTo?.id,
        _optimistic: {
          tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: {
            id: me.id,
            firstName: me.firstName,
            lastName: me.lastName,
            avatarUrl: me.avatar ?? null,
            isMe: true,
          },
          attachments: pendingAttachment ? [pendingAttachment] : undefined,
        },
      });

      setPendingAttachment(null);
      setReplyingTo(null);
    },
    [selectedConversationId, replyingTo, sendMessage, me, stopTyping, pendingAttachment],
  );

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // permet de re-sélectionner le même fichier
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 10 Mo)');
        return;
      }
      try {
        const uploaded = await uploadAttachment.mutateAsync(file);
        setPendingAttachment(uploaded);
      } catch {
        // toast déjà géré par le hook
      }
    },
    [uploadAttachment],
  );

  // Aperçu de la pièce jointe en attente (partagé desktop/mobile).
  const attachmentPreview = uploadAttachment.isPending ? (
    <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary p-2.5">
      <RefreshCw01 className="size-4 animate-spin text-tertiary" />
      <p className="text-sm text-tertiary">Téléchargement de la pièce jointe…</p>
    </div>
  ) : pendingAttachment ? (
    <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary p-2.5">
      {pendingAttachment.type === 'IMAGE' ? (
        <img
          src={pendingAttachment.url}
          alt={pendingAttachment.name}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-white">
          <File02 className="size-5 text-tertiary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-primary">{pendingAttachment.name}</p>
        <p className="text-xs text-tertiary">{formatBytes(pendingAttachment.size)}</p>
      </div>
      <Button
        type="button"
        iconLeading={X}
        size="sm"
        color="tertiary"
        onClick={() => setPendingAttachment(null)}
        aria-label="Retirer la pièce jointe"
      />
    </div>
  ) : null;

  const handleTypingStart = useCallback(() => {
    if (!selectedConversationId) return;
    startTyping(selectedConversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 3000);
  }, [selectedConversationId, startTyping, stopTyping]);

  const handleTypingStop = useCallback(() => {
    if (!selectedConversationId) return;
    stopTyping(selectedConversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [selectedConversationId, stopTyping]);

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!selectedConversationId) return;
      editMessage.mutate({
        messageId,
        content: newContent,
        conversationId: selectedConversationId,
      });
      setEditingMessageId(null);
    },
    [selectedConversationId, editMessage],
  );

  const handleDeleteMessage = useCallback(
    (message: Message) => {
      if (!selectedConversationId || !message.sender.isMe) return;
      setMessageToDelete(message);
    },
    [selectedConversationId],
  );

  const confirmDeleteMessage = useCallback(() => {
    if (!messageToDelete || !selectedConversationId) return;
    deleteMessage.mutate(
      { messageId: messageToDelete.id, conversationId: selectedConversationId },
      { onSettled: () => setMessageToDelete(null) },
    );
  }, [messageToDelete, selectedConversationId, deleteMessage]);

  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!selectedConversationId) return;
      addReaction.mutate({
        messageId,
        emoji,
        conversationId: selectedConversationId,
      });
    },
    [selectedConversationId, addReaction],
  );

  const handleCopyMessage = useCallback((message: Message) => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success('Message copié !');
    }
  }, []);

  const handleReplyToMessage = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      const conv = conversations.find(c => c.id === conversationId);
      unreadCountOnSelect.current = conv?.unreadCount ?? 0;
      setSelectedConversationId(conversationId);
      setEditingMessageId(null);
      setReplyingTo(null);
    },
    [conversations],
  );

  const handleBackToConversationList = useCallback(() => {
    handleTypingStop();
    setSelectedConversationId(null);
    setEditingMessageId(null);
    setReplyingTo(null);
  }, [handleTypingStop]);

  const handleConversationCreated = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      refetchConversations();
    },
    [refetchConversations],
  );

  // ==================== TRANSFORMED DATA ====================

  const transformedMessages = useMemo(() => {
    return allMessages
      .filter(Boolean)
      .map(msg => {
        const sender = msg.sender ?? {
          id: 'unknown',
          firstName: 'Unknown',
          lastName: '',
          avatarUrl: null,
          isMe: false,
        };
        const createdAt = msg.createdAt ?? new Date().toISOString();
        const normalizedStatus = (msg.status ?? 'sent').toLowerCase();

        // Le composant MessageItem attend `image` / `attachment` (singulier) ;
        // on dérive ces champs du tableau `attachments` renvoyé par l'API.
        const atts = msg.attachments ?? [];
        const imageAtt = atts.find(
          (a: any) => a.type === 'IMAGE' || a.mimeType?.startsWith('image/'),
        );
        const fileAtt = atts.find((a: any) => a !== imageAtt);
        const image = imageAtt
          ? {
              src: imageAtt.url,
              alt: imageAtt.name,
              name: imageAtt.name,
              size: formatBytes(imageAtt.size),
            }
          : undefined;
        const attachment = fileAtt
          ? {
              type: extFromName(fileAtt.name),
              name: fileAtt.name,
              size: formatBytes(fileAtt.size),
            }
          : undefined;

        return {
          id: msg.id,
          text: msg.content,
          createdAt,
          sentAt: new Date(createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: {
            name: `${sender.firstName ?? 'Unknown'} ${sender.lastName ?? ''}`.trim(),
            avatarUrl: sender.avatarUrl ?? undefined,
            me: Boolean(sender.isMe),
          },
          status: (normalizedStatus === 'delivered' ? 'sent' : normalizedStatus) as
            | 'sent'
            | 'read'
            | 'failed'
            | undefined,
          reactions: (msg.reactions ?? []).map((r: any) => ({
            content: r.emoji,
            count: r.count,
            users:
              r.users?.map((u: any) => `${u.firstName} ${u.lastName}`.trim()) ?? [],
          })),
          reply: msg.replyTo ? { text: msg.replyTo.content ?? '' } : undefined,
          image,
          attachment,
          editedAt: msg.editedAt,
          senderId: sender.id,
        };
      });
  }, [allMessages]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof transformedMessages }[] = [];
    let currentDate = '';

    transformedMessages.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
  }, [transformedMessages]);

  const firstUnreadMessageId = useMemo(() => {
    if (!unreadCountOnSelect.current || unreadCountOnSelect.current === 0) return null;
    const idx = transformedMessages.length - unreadCountOnSelect.current;
    if (idx <= 0 || idx >= transformedMessages.length) return null;
    return transformedMessages[idx].id;
  }, [transformedMessages]);

  const showSidebar = isDesktop || !selectedConversationId;
  const showConversationPane = isDesktop || Boolean(selectedConversationId);
  const selectedParticipant = selectedConversation?.participants[0];
  const canViewSelectedProfile =
    selectedConversation?.type !== 'GROUP' && Boolean(selectedParticipant?.id);

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col h-screen bg-[#FCFCFD]">
      <CreateConversationModal
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
        onConversationCreated={handleConversationCreated}
      />

      <ConversationContextPanel
        profileId={canViewSelectedProfile ? selectedParticipant?.id ?? null : null}
        open={showContextPanel}
        onClose={() => setShowContextPanel(false)}
      />

      <ConfirmModal
        open={!!messageToDelete}
        onOpenChange={(open) => { if (!open) setMessageToDelete(null); }}
        title="Supprimer ce message ?"
        description="Ce message sera supprimé pour tous les participants. Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMessage.isPending}
        onConfirm={confirmDeleteMessage}
      />

      <header className="shrink-0">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden">
          {/* Sidebar */}
          <div
            className={cn(
              'relative h-full w-full lg:w-90 overflow-hidden overflow-y-auto border-r border-secondary bg-primary flex-shrink-0',
              showSidebar ? 'block' : 'hidden',
            )}
          >
            <div className="flex items-center justify-between gap-4 bg-primary px-6 py-5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-primary">Messages</span>
                <Badge size="sm" type="modern" color="gray">
                  {conversations.length}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  iconLeading={RefreshCw01}
                  color="tertiary"
                  size="sm"
                  onClick={() => refetchConversations()}
                  disabled={isLoadingConversations}
                  aria-label="Rafraîchir"
                />
                <Button
                  iconLeading={MessageChatCircle}
                  color="tertiary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  aria-label="Nouvelle conversation"
                />
              </div>
            </div>

            <div className="px-4 pb-3">
              <Input
                icon={SearchLg}
                shortcut
                aria-label="Rechercher"
                placeholder="Rechercher des conversations..."
                size="sm"
                value={searchQuery}
                onChange={(value: string) => setSearchQuery(value)}
              />
            </div>

            <div className="flex items-center gap-1 px-4 pb-3">
              {([
                { key: 'all', label: 'Tous', count: conversations.length },
                { key: 'unread', label: 'Non lus', count: unreadTabCount },
                { key: 'requests', label: 'Demandes', count: requestsTabCount },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setInboxTab(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    inboxTab === tab.key
                      ? 'bg-[#5E6AD2] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(inboxTab === tab.key ? 'opacity-80' : 'opacity-60')}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isLoadingConversations ? (
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <ConversationSkeleton key={i} />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <MessageChatCircle className="w-12 h-12 mx-auto mb-4 text-tertiary" />
                <p className="font-medium text-primary">Aucune conversation</p>
                <p className="text-sm text-tertiary mt-1 mb-4">
                  Commencez une nouvelle conversation
                </p>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  Nouveau message
                </Button>
              </div>
            ) : visibleConversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <MessageChatCircle className="w-12 h-12 mx-auto mb-4 text-tertiary" />
                <p className="font-medium text-primary">
                  {inboxTab === 'unread' ? 'Aucun message non lu' : inboxTab === 'requests' ? 'Aucune demande' : 'Aucune conversation'}
                </p>
              </div>
            ) : (
              <ListBox
                aria-label="Conversations"
                selectionMode="single"
                items={visibleConversations}
                selectedKeys={selectedConversationId ? [selectedConversationId] : []}
                onSelectionChange={keys => {
                  const conversationId = Array.from(keys).at(0) as string;
                  if (conversationId) {
                    handleConversationSelect(conversationId);
                  }
                }}
              >
                {item => <ConversationListItem id={item.id} key={item.id} value={item} />}
              </ListBox>
            )}
          </div>

          {/* Main Content */}
          <div
            className={cn(
              'relative flex max-h-full flex-1 flex-col overflow-hidden min-w-0',
              showConversationPane ? 'flex' : 'hidden',
            )}
          >
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="sticky top-0 z-10 flex w-full items-center gap-3 bg-primary px-4 py-3 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border-secondary lg:px-6">
                  <Button
                    iconLeading={ArrowLeft}
                    color="tertiary"
                    size="sm"
                    className="lg:hidden flex-shrink-0"
                    onClick={handleBackToConversationList}
                    aria-label="Retour"
                  />
                  <button
                    type="button"
                    className={cn(
                      'flex-shrink-0 rounded-full',
                      canViewSelectedProfile && 'cursor-pointer hover:opacity-80 transition-opacity',
                    )}
                    onClick={() =>
                      canViewSelectedProfile &&
                      router.push(`/profile/${selectedParticipant?.id}`)
                    }
                  >
                    <Avatar
                      src={selectedParticipant?.avatarUrl ?? undefined}
                      alt={selectedConversation.name}
                      firstName={selectedParticipant?.firstName}
                      lastName={selectedParticipant?.lastName}
                      size="md"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-primary">
                        {selectedConversation.type === 'GROUP'
                          ? selectedConversation.name
                          : selectedParticipant
                            ? `${selectedParticipant.firstName} ${selectedParticipant.lastName}`
                            : 'Unknown'}
                      </span>
                      {selectedParticipant && (
                        <BadgeWithDot
                          color={
                            isOnline(selectedParticipant.id) ? 'success' : 'gray'
                          }
                          size="sm"
                          type="modern"
                          className="hidden sm:inline-flex flex-shrink-0"
                        >
                          {isOnline(selectedParticipant.id)
                            ? 'En ligne'
                            : 'Hors ligne'}
                        </BadgeWithDot>
                      )}
                    </div>
                  </div>
                  {canViewSelectedProfile && (
                    <>
                      <Button
                        size="sm"
                        color="tertiary"
                        className="flex-shrink-0 hidden sm:inline-flex"
                        onClick={() =>
                          router.push(`/profile/${selectedParticipant?.id}`)
                        }
                      >
                        Voir le profil
                      </Button>
                      <Button
                        size="sm"
                        color="tertiary"
                        iconLeading={InfoCircle}
                        className="flex-shrink-0"
                        onClick={() => setShowContextPanel(true)}
                        aria-label="Infos sur l'interlocuteur"
                      />
                    </>
                  )}
                </div>

                {/* Messages */}
                {isLoadingMessages ? (
                  <div className="flex-1 flex flex-col gap-4 p-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <MessageSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <ul
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex flex-1 flex-col gap-y-4 overflow-y-auto bg-primary px-4 py-8 *:first:mt-auto lg:px-6"
                  >
                    {/* Infinite scroll sentinel */}
                    {hasNextPage && (
                      <li ref={loadMoreSentinelRef} className="flex justify-center py-2">
                        {isFetchingNextPage && (
                          <span className="text-sm text-tertiary animate-pulse">
                            Chargement...
                          </span>
                        )}
                      </li>
                    )}

                    {groupedMessages.map(group => (
                      <Fragment key={group.date}>
                        <ContentDivider type="single-line" className="py-2">
                          <span className="text-sm font-medium text-tertiary">
                            {new Date(group.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </ContentDivider>
                        {group.messages.map(msg => (
                          <Fragment key={msg.id}>
                            {msg.id === firstUnreadMessageId && (
                              <ContentDivider type="single-line" className="py-2">
                                <span className="text-sm font-medium text-fg-brand-secondary">
                                  Nouveaux messages
                                </span>
                              </ContentDivider>
                            )}
                            <MessageItem
                              msg={msg}
                              className="lg:max-w-140"
                              isEditing={editingMessageId === msg.id}
                              onCopy={() =>
                                handleCopyMessage(msg as unknown as Message)
                              }
                              onEdit={() => setEditingMessageId(msg.id)}
                              onSaveEdit={(id, text) => handleEditMessage(id, text)}
                              onCancelEdit={() => setEditingMessageId(null)}
                              onReply={() =>
                                handleReplyToMessage(msg as unknown as Message)
                              }
                              onDelete={() =>
                                handleDeleteMessage(msg as unknown as Message)
                              }
                              onReact={emoji => handleAddReaction(msg.id, emoji)}
                            />
                          </Fragment>
                        ))}
                      </Fragment>
                    ))}

                    {/* Typing indicator */}
                    {isOtherTyping && typingProfiles.length > 0 && (
                      <li className="flex gap-3">
                        <Avatar
                          src={
                            selectedConversation.participants.find(p =>
                              typingProfiles.includes(p.id),
                            )?.avatarUrl ?? undefined
                          }
                          alt="typing"
                          firstName={
                            selectedConversation.participants.find(p =>
                              typingProfiles.includes(p.id),
                            )?.firstName
                          }
                          lastName={
                            selectedConversation.participants.find(p =>
                              typingProfiles.includes(p.id),
                            )?.lastName
                          }
                          size="md"
                        />
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-secondary">
                            {typingProfiles.length === 1
                              ? (selectedConversation.participants.find(p =>
                                  typingProfiles.includes(p.id),
                                )?.firstName ?? "Quelqu'un")
                              : `${typingProfiles.length} personnes`}{' '}
                            {typingProfiles.length === 1 ? 'écrit' : 'écrivent'}...
                          </p>
                          <div className="inline-flex gap-1 rounded-lg rounded-tl-none bg-secondary p-2.5 text-md text-primary ring-1 ring-secondary ring-inset">
                            <div className="size-1 animate-bounce rounded-full bg-fg-tertiary [animation-delay:-0.3s]" />
                            <div className="size-1 animate-bounce rounded-full bg-fg-quaternary [animation-delay:-0.15s]" />
                            <div className="size-1 animate-bounce rounded-full bg-fg-tertiary" />
                          </div>
                        </div>
                      </li>
                    )}

                    <div ref={messagesEndRef} />
                  </ul>
                )}

                {/* Scroll to bottom */}
                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-28 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg border border-secondary hover:bg-secondary_subtle transition-colors"
                    aria-label="Défiler vers le bas"
                  >
                    <svg
                      className="size-4 text-tertiary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Input fichier caché partagé (images + documents) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
                  onChange={handleFileSelected}
                />

                {/* Desktop Input */}
                <Form
                  onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const message = formData.get('message') as string;
                    handleSendMessage(message);
                    e.currentTarget.reset();
                  }}
                  className="sticky bottom-0 hidden bg-primary px-6 pb-6 lg:block"
                >
                  {replyingTo && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary p-3">
                      <div className="flex-1">
                        <p className="text-xs text-tertiary">
                          Réponse à {replyingTo.sender.firstName}
                        </p>
                        <p className="text-sm text-primary truncate">
                          {replyingTo.content ?? 'Message'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        iconLeading={X}
                        size="sm"
                        color="tertiary"
                        onClick={() => setReplyingTo(null)}
                        aria-label="Annuler la réponse"
                      />
                    </div>
                  )}
                  {attachmentPreview}
                  <TextArea
                    aria-label="Message"
                    name="message"
                    placeholder={
                      replyingTo
                        ? `Répondre à ${replyingTo.sender.firstName}...`
                        : 'Écrire un message...'
                    }
                    className="max-h-120 min-h-20"
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const form = (e.target as HTMLTextAreaElement).form;
                        if (form) form.requestSubmit();
                      } else if (e.key !== 'Enter') {
                        handleTypingStart();
                      }
                    }}
                    onBlur={handleTypingStop}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <Button
                      type="button"
                      iconLeading={Paperclip}
                      size="md"
                      color="tertiary"
                      onClick={() => fileInputRef.current?.click()}
                      isDisabled={uploadAttachment.isPending}
                      aria-label="Joindre un fichier"
                    />
                    <Button
                      type="submit"
                      size="md"
                      isDisabled={sendMessage.isPending || uploadAttachment.isPending}
                    >
                      {sendMessage.isPending
                        ? 'Envoi...'
                        : replyingTo
                          ? 'Répondre'
                          : 'Envoyer'}
                    </Button>
                  </div>
                </Form>

                {/* Mobile Input */}
                <Form
                  onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const message = formData.get('message') as string;
                    handleSendMessage(message);
                    e.currentTarget.reset();
                  }}
                  className="flex flex-col gap-3 bg-primary px-4 pb-6 lg:hidden"
                >
                  {replyingTo && (
                    <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                      <div className="flex-1">
                        <p className="text-xs text-tertiary">
                          Réponse à {replyingTo.sender.firstName}
                        </p>
                        <p className="text-sm text-primary truncate">
                          {replyingTo.content ?? 'Message'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        iconLeading={X}
                        size="sm"
                        color="tertiary"
                        onClick={() => setReplyingTo(null)}
                      />
                    </div>
                  )}
                  {attachmentPreview}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      iconLeading={Paperclip}
                      color="tertiary"
                      onClick={() => fileInputRef.current?.click()}
                      isDisabled={uploadAttachment.isPending}
                      aria-label="Joindre un fichier"
                    />
                    <Input
                      name="message"
                      placeholder={
                        replyingTo
                          ? `Répondre à ${replyingTo.sender.firstName}...`
                          : 'Écrire un message...'
                      }
                      size="md"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key !== 'Enter') {
                          handleTypingStart();
                        }
                      }}
                      onBlur={handleTypingStop}
                    />
                    <Button
                      type="submit"
                      iconLeading={Send01}
                      isDisabled={sendMessage.isPending || uploadAttachment.isPending}
                    />
                  </div>
                </Form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-primary">
                <div className="text-center max-w-md mx-auto px-6">
                  <MessageChatCircle className="w-16 h-16 mx-auto mb-6 text-tertiary" />
                  <h2 className="text-xl font-semibold text-primary mb-3">
                    Vos messages
                  </h2>
                  <p className="text-tertiary mb-6">
                    Sélectionnez une conversation ou commencez-en une nouvelle.
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Nouveau message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
