import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, Heart, MessageSquare, UserPlus, Send } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { useNotificationsList, useMarkAllNotificationsRead, useDeleteNotification, useNotificationCounts, type NotificationItem } from '@/hooks/useNotificationsApi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SpotlightNotificationsProps {
  onNotificationAction?: (notificationId: string, action: string) => void;
}

export const SpotlightNotifications = ({ onNotificationAction }: SpotlightNotificationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: notificationsData, isLoading } = useNotificationsList({
    limit: 20,
    read: false,
    enabled: true,
  });
  const { data: countsData } = useNotificationCounts();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.notifications ?? [];
  const unreadCount = countsData?.total ?? 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'POST_LIKED':
      case 'POST_REACTION':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'POST_COMMENTED':
      case 'COMMENT_REPLY':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'PROFILE_FOLLOWED':
      case 'NEW_FOLLOWER':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'INVITATION_RECEIVED':
      case 'INVITATION_ACCEPTED':
        return <Send className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (category: string) => {
    switch (category) {
      case 'engagement':
        return 'border-blue-200 bg-blue-50';
      case 'invitations':
        return 'border-purple-200 bg-purple-50';
      case 'system':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const handleDismiss = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    onNotificationAction?.(notification.id, notification.type);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton de notifications */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          color="secondary"
          size="lg"
          className="h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Panneau de notifications */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                color="tertiary"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2" />
                    <p className="text-sm">Chargement...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 text-center text-gray-500"
                  >
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucune notification</p>
                  </motion.div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:opacity-80 transition-opacity ${getNotificationColor(notification.category)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <Button
                              color="tertiary"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleDismiss(notification.id);
                              }}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Button
                  color="tertiary"
                  size="sm"
                  onClick={handleMarkAllRead}
                  isDisabled={markAllReadMutation.isPending}
                  className="w-full text-xs text-gray-600 hover:text-gray-900"
                >
                  {markAllReadMutation.isPending ? 'En cours...' : 'Tout marquer comme lu'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 