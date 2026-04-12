import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface NotificationManagerProps {
  onNotificationPermission: (granted: boolean) => void;
}

const NotificationManager = ({ onNotificationPermission }: NotificationManagerProps) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées par votre navigateur');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      onNotificationPermission(result === 'granted');
      
      if (result === 'granted') {
        toast.success('Notifications activées !');
      } else {
        toast.error('Notifications refusées');
      }
    } catch {
      toast.error('Erreur lors de la demande de permission');
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('OneFive Messages', {
        body: 'Vous avez reçu un nouveau message !',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'message',
        requireInteraction: false,
        silent: false,
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {permission === 'granted' ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={sendTestNotification}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Test
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPermission('denied')}
            className="gap-2"
          >
            <BellOff className="h-4 w-4" />
            Désactiver
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={requestPermission}
          className="gap-2"
        >
          <Bell className="h-4 w-4" />
          Activer les notifications
        </Button>
      )}
    </div>
  );
};

export default NotificationManager; 