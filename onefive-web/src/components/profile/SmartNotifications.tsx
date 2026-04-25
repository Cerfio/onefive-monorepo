'use client';

import { useState } from 'react';
import { 
  Bell, 
  Users, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  Check
} from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Card, CardContent } from '@/components/base/card/card';
import { Avatar } from '@/components/base/avatar/avatar';
import { toast } from 'sonner';

// Types pour les notifications intelligentes
interface SmartNotification {
  id: string;
  type: 'network_connection' | 'investor_activity' | 'network_interaction' | 'target_interaction';
  title: string;
  description: string;
  profileName: string;
  profileAvatar: string;
  relatedProfileName?: string;
  relatedProfileAvatar?: string;
  activity?: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

// TODO: Replace with real API data via useNotificationsApi when backend is ready
const mockNotifications: SmartNotification[] = [];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'network_connection': return <Users className="h-4 w-4" />;
    case 'investor_activity': return <DollarSign className="h-4 w-4" />;
    case 'network_interaction': return <MessageSquare className="h-4 w-4" />;
    case 'target_interaction': return <TrendingUp className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const _getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return <Badge type="pill-color" color="error" size="sm">Urgent</Badge>;
    case 'medium': return <Badge type="pill-color" color="warning" size="sm">Important</Badge>;
    case 'low': return <Badge type="pill-color" color="gray" size="sm">Info</Badge>;
    default: return null;
  }
};

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>(mockNotifications);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success('Notification marquée comme lue');
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('Toutes les notifications marquées comme lues');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Notifications intelligentes</h3>
          {unreadCount > 0 && (
            <Badge type="pill-color" color="error" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button color="secondary" size="sm" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {displayedNotifications.map(notification => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-200 ${
              notification.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar principal */}
                <Avatar
                  src={notification.profileAvatar}
                  initials={notification.profileName?.[0]}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <p className="font-semibold text-sm">{notification.title}</p>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.description}
                      </p>
                      
                      {/* Avatar secondaire si applicable */}
                      {notification.relatedProfileName && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">avec</span>
                                                     <div className="flex items-center gap-1">
                             <Avatar
                               src={notification.relatedProfileAvatar!}
                               initials={notification.relatedProfileName?.[0]}
                             />
                             <span className="text-xs font-medium">{notification.relatedProfileName}</span>
                           </div>
                        </div>
                      )}
                      
                      {/* Activité spécifique */}
                      {notification.activity && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs text-gray-500">Activité:</span>
                          <Badge type="pill-color" color="gray" size="sm">
                            {notification.activity}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            color="tertiary" 
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bouton pour voir plus */}
      {notifications.length > 5 && (
        <div className="text-center">
          <Button 
            color="secondary" 
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? 'Voir moins' : `Voir ${notifications.length - 5} notifications supplémentaires`}
          </Button>
        </div>
      )}

      {/* Aucune notification */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">
              Les notifications intelligentes apparaîtront ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 