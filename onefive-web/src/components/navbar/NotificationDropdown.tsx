'use client';
import React, { useState, useEffect } from 'react';
import type { Key } from 'react-aria-components';
import { useRouter } from 'next/navigation';
import { Bell01, Check, Building07, LayersTwo01, Heart, MessageCircle01, AtSign, UserPlus01, Eye, ArrowRight, XClose } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Tabs } from '@/components/application/tabs/tabs';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Avatar } from '@/components/base/avatar/avatar';
import { useNotifications } from './hooks/useNotifications';
import { useNotificationsList, useMarkNotificationRead, type NotificationItem } from '@/hooks/useNotificationsApi';
import { useAcceptInvitation, useDeclineInvitation, useAcceptInvestorInvitation, useDeclineInvestorInvitation } from '@/queries/startup';
import { getBadgeClasses } from './constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Helper pour formater la date relative
const formatRelativeTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
  } catch {
    return 'récemment';
  }
};

// Helper pour obtenir l'icône selon le type de notification
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'LIKE':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'COMMENT':
    case 'COMMENT_REPLY':
      return <MessageCircle01 className="w-4 h-4 text-blue-500" />;
    case 'MENTION':
      return <AtSign className="w-4 h-4 text-purple-500" />;
    case 'FOLLOW':
      return <UserPlus01 className="w-4 h-4 text-green-500" />;
    case 'PROFILE_VIEW':
      return <Eye className="w-4 h-4 text-gray-500" />;
    case 'SHARE':
      return <ArrowRight className="w-4 h-4 text-orange-500" />;
    case 'STARTUP_INVITATION':
    case 'INVESTOR_INVITATION':
    case 'DATAROOM_INVITATION':
      return <Building07 className="w-4 h-4 text-purple-600" />;
    case 'CONNECTION_REQUEST':
      return <UserPlus01 className="w-4 h-4 text-blue-600" />;
    case 'CONNECTION_ACCEPTED':
      return <UserPlus01 className="w-4 h-4 text-green-600" />;
    case 'REFERRAL_ACCEPTED':
      return <UserPlus01 className="w-4 h-4 text-emerald-500" />;
    case 'SYSTEM_ANNOUNCEMENT':
    case 'DATAROOM_UPDATE':
    case 'DOCUMENT_UPLOADED':
      return <LayersTwo01 className="w-4 h-4 text-blue-600" />;
    default:
      return <Bell01 className="w-4 h-4 text-gray-500" />;
  }
};

// Helper pour obtenir la couleur du point non lu selon la catégorie
const getUnreadDotColor = (category: string, type: string) => {
  if (category === 'engagement') return 'bg-blue-500';
  if (category === 'invitations') return 'bg-green-500';
  if (category === 'system') {
    if (type === 'SYSTEM_ANNOUNCEMENT') return 'bg-orange-500';
    return 'bg-blue-500';
  }
  return 'bg-blue-500';
};

// Helper pour obtenir l'URL de redirection selon le type de notification
const getNotificationLink = (notification: NotificationItem): string | null => {
  const { entityId, entityType, type: _type, data } = notification;
  
  if (!entityId) return null;
  
  switch (entityType) {
    case 'POST':
      // Pour les likes, commentaires, mentions sur un post
      return `/feed/${entityId}`;
    case 'COMMENT':
      // Pour les réponses à commentaire, on redirige vers le post (postId est dans data)
      if (data && typeof data === 'object' && 'postId' in data) {
        return `/feed/${data.postId}`;
      }
      return null;
    case 'PROFILE':
      // Pour les follows et demandes de connexion
      return `/profile/${entityId}`;
    case 'STARTUP':
      // Pour les invitations startup
      return `/startup/${entityId}`;
    case 'DATAROOM':
      // Pour les updates de dataroom
      return `/dataroom/${entityId}`;
    case 'REFERRAL':
      // Pour les acceptations de parrainage, on redirige vers le profil
      if (notification.actorId) {
        return `/profile/${notification.actorId}`;
      }
      return '/invite';
    case 'DISCUSSION':
      // Pour les réponses à une discussion
      return `/discussions/${entityId}`;
    default:
      return null;
  }
};

// Composant pour afficher une notification
const NotificationItemComponent: React.FC<{
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onNavigate: (url: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onDeclineInvitation?: (invitationId: string) => void;
  onAcceptInvestorInvitation?: (investorRecordId: string) => void;
  onDeclineInvestorInvitation?: (investorRecordId: string) => void;
  isProcessingInvitation?: boolean;
}> = ({ notification, onMarkRead, onNavigate, onAcceptInvitation, onDeclineInvitation, onAcceptInvestorInvitation, onDeclineInvestorInvitation, isProcessingInvitation }) => {
  const link = getNotificationLink(notification);
  
  const isStartupInvitation = notification.type === 'STARTUP_INVITATION' && 
    notification.data && 
    typeof notification.data === 'object' && 
    'invitationId' in notification.data &&
    'actions' in notification.data;

  const isInvestorInvitation = notification.type === 'INVESTOR_INVITATION' &&
    notification.data &&
    typeof notification.data === 'object' &&
    'investorRecordId' in notification.data;

  const hasActions = isStartupInvitation || isInvestorInvitation;
  
  const invitationId = isStartupInvitation ? (notification.data as any).invitationId : null;
  const investorRecordId = isInvestorInvitation ? (notification.data as any).investorRecordId : null;
  
  const handleClick = () => {
    if (hasActions) return;
    
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (link) {
      onNavigate(link);
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStartupInvitation && invitationId && onAcceptInvitation) {
      onAcceptInvitation(invitationId);
      onMarkRead(notification.id);
    } else if (isInvestorInvitation && investorRecordId && onAcceptInvestorInvitation) {
      onAcceptInvestorInvitation(investorRecordId);
      onMarkRead(notification.id);
    }
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStartupInvitation && invitationId && onDeclineInvitation) {
      onDeclineInvitation(invitationId);
      onMarkRead(notification.id);
    } else if (isInvestorInvitation && investorRecordId && onDeclineInvestorInvitation) {
      onDeclineInvestorInvitation(investorRecordId);
      onMarkRead(notification.id);
    }
  };

  // Extraire prénom et nom du titre (format: "Prénom Nom")
  const nameParts = notification.title.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div 
      className={`flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors ${!hasActions && link ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleClick}
    >
      <div className="relative shrink-0">
        <Avatar 
          src={notification.actorAvatar}
          firstName={firstName}
          lastName={lastName}
          size="sm"
          alt={notification.title}
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          {getNotificationIcon(notification.type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{notification.title}</span>
          {notification.message && (
            <span className="text-gray-600"> {notification.message}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
        
        {hasActions && !notification.read && (
          <div className="flex gap-2 mt-2">
            <Button
              color="primary"
              size="sm"
              className="text-xs"
              onClick={handleAccept}
              isDisabled={isProcessingInvitation}
            >
              <Check className="w-3 h-3 mr-1" />
              Accepter
            </Button>
            <Button
              color="secondary"
              size="sm"
              className="text-xs"
              onClick={handleDecline}
              isDisabled={isProcessingInvitation}
            >
              <XClose className="w-3 h-3 mr-1" />
              Refuser
            </Button>
          </div>
        )}
      </div>
      {!notification.read && !hasActions && (
        <div className={`w-2 h-2 ${getUnreadDotColor(notification.category, notification.type)} rounded-full shrink-0 mt-2`} />
      )}
    </div>
  );
};

// Composant pour l'état vide
const EmptyState: React.FC<{ category: string }> = ({ category }) => (
  <div className="py-8 text-center">
    <Bell01 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500">
      {category === 'engagement' && "Pas de nouvelles interactions"}
      {category === 'invitations' && "Aucune invitation en attente"}
      {category === 'system' && "Aucune notification système"}
    </p>
  </div>
);

const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const { hasUnread, counts, totalCount, markAllAsRead } = useNotifications();
  const [selectedTab, setSelectedTab] = useState<Key>("engagement");
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch des notifications réelles
  const { data: notificationsData, isLoading: isLoadingNotifications, refetch: refetchNotifications } = useNotificationsList({
    limit: 20,
  });
  
  // Invitation mutations
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();
  const acceptInvestorMutation = useAcceptInvestorInvitation();
  const declineInvestorMutation = useDeclineInvestorInvitation();
  const isProcessingInvitation = acceptInvitationMutation.isPending || declineInvitationMutation.isPending || acceptInvestorMutation.isPending || declineInvestorMutation.isPending;
  
  // Refetch les notifications quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen) {
      refetchNotifications();
    }
  }, [isOpen, refetchNotifications]);
  
  const markReadMutation = useMarkNotificationRead();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleNavigate = (url: string) => {
    setIsOpen(false); // Fermer le dropdown
    router.push(url);
  };

  const handleAcceptInvitation = (invitationId: string) => {
    acceptInvitationMutation.mutate(invitationId, {
      onSuccess: () => {
        refetchNotifications();
      }
    });
  };

  const handleDeclineInvitation = (invitationId: string) => {
    declineInvitationMutation.mutate(invitationId, {
      onSuccess: () => {
        refetchNotifications();
      }
    });
  };

  const handleAcceptInvestorInvitation = (investorRecordId: string) => {
    acceptInvestorMutation.mutate(investorRecordId, {
      onSuccess: () => {
        refetchNotifications();
      }
    });
  };

  const handleDeclineInvestorInvitation = (investorRecordId: string) => {
    declineInvestorMutation.mutate(investorRecordId, {
      onSuccess: () => {
        refetchNotifications();
      }
    });
  };

  // Filtrer les notifications par catégorie
  const getNotificationsForCategory = (category: string): NotificationItem[] => {
    if (notificationsData?.notifications) {
      return notificationsData.notifications.filter(n => n.category === category);
    }
    return [];
  };

  const tabs = [
    { 
      id: "engagement", 
      label: "Engagement",
      badge: counts.engagement > 0 ? counts.engagement : undefined
    },
    { 
      id: "invitations", 
      label: "Invitations",
      badge: counts.invitations > 0 ? counts.invitations : undefined
    },
    { 
      id: "system", 
      label: "Système",
      badge: counts.system > 0 ? counts.system : undefined
    },
  ];

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        color="link-gray"
        size="md"
        className="relative rounded-xl hover:bg-gray-100 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
        iconLeading={<Bell01 className="h-5 w-5" />}
      >
        {hasUnread && (
          <div 
            className={getBadgeClasses()}
            aria-label={`${totalCount} notifications non lues`}
          >
            <span className="text-white text-[10px] font-medium">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          </div>
        )}
        <span className="sr-only">
          {hasUnread ? `${totalCount} notifications non lues` : 'Aucune notification'}
        </span>
      </Button>

      <Dropdown.Popover className="w-[480px]">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800 text-sm font-semibold">
              Notifications
            </h3>
            <Button
              color="secondary"
              size="sm"
              className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50"
              onClick={markAllAsRead}
              iconLeading={<Check className="w-3 h-3" />}
            >
              Tout marquer comme lu
            </Button>
          </div>
          
          <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} className="w-full">
            <Tabs.List type="underline" items={tabs} className="mb-4">
              {(tab) => <Tabs.Item {...tab} />}
            </Tabs.List>
            
            <Tabs.Panel id="engagement" className="space-y-1 max-h-[400px] overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : getNotificationsForCategory('engagement').length > 0 ? (
                getNotificationsForCategory('engagement').map((notification) => (
                  <NotificationItemComponent
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onNavigate={handleNavigate}
                  />
                ))
              ) : (
                <EmptyState category="engagement" />
              )}
            </Tabs.Panel>
            
            <Tabs.Panel id="invitations" className="space-y-1 max-h-[400px] overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : getNotificationsForCategory('invitations').length > 0 ? (
                getNotificationsForCategory('invitations').map((notification) => (
                  <NotificationItemComponent
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onNavigate={handleNavigate}
                    onAcceptInvitation={handleAcceptInvitation}
                    onDeclineInvitation={handleDeclineInvitation}
                    onAcceptInvestorInvitation={handleAcceptInvestorInvitation}
                    onDeclineInvestorInvitation={handleDeclineInvestorInvitation}
                    isProcessingInvitation={isProcessingInvitation}
                  />
                ))
              ) : (
                <EmptyState category="invitations" />
              )}
            </Tabs.Panel>
            
            <Tabs.Panel id="system" className="space-y-1 max-h-[400px] overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : getNotificationsForCategory('system').length > 0 ? (
                getNotificationsForCategory('system').map((notification) => (
                  <NotificationItemComponent
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onNavigate={handleNavigate}
                  />
                ))
              ) : (
                <EmptyState category="system" />
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
};

export default NotificationDropdown; 