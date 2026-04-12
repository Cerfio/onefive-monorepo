import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, AtSign, Award } from 'lucide-react';

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'upvote' | 'reply' | 'mention' | 'achievement';
    message: string;
    user?: { name: string; avatar: string };
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Simuler des notifications en temps réel
    const interval = setInterval(() => {
      const messages = [
        { type: 'upvote' as const, message: 'Sarah a voté pour votre réponse', user: { name: 'Sarah M.', avatar: '' }},
        { type: 'reply' as const, message: 'Nouvelle réponse à votre discussion', user: { name: 'Thomas D.', avatar: '' }},
        { type: 'mention' as const, message: 'Vous avez été mentionné dans une réponse', user: { name: 'Marie L.', avatar: '' }},
        { type: 'achievement' as const, message: 'Objectif atteint: 10 votes reçus 🏆', user: undefined }
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newNotification = {
        id: Date.now().toString(),
        ...randomMessage,
        timestamp: new Date()
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${
                notification.type === 'upvote' ? 'bg-green-100' :
                notification.type === 'reply' ? 'bg-blue-100' :
                notification.type === 'mention' ? 'bg-purple-100' :
                'bg-yellow-100'
              }`}>
                {notification.type === 'upvote' && <ThumbsUp className="h-3 w-3 text-green-600" />}
                {notification.type === 'reply' && <MessageSquare className="h-3 w-3 text-blue-600" />}
                {notification.type === 'mention' && <AtSign className="h-3 w-3 text-purple-600" />}
                {notification.type === 'achievement' && <Award className="h-3 w-3 text-yellow-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{notification.message}</p>
                {notification.user && (
                  <p className="text-xs text-gray-500 mt-1">{notification.user.name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveNotifications; 