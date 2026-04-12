import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getBadgeClasses, NAVBAR_CONSTANTS } from './constants';
import { useUnreadCount } from '@/hooks/useMessaging';

interface NavigationItemProps {
  item: {
    name: string;
    icon: React.ReactNode;
    link: string;
    description: string;
  };
  isActive: boolean;
  isMobile?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item, isActive, isMobile = false }) => {
  // Badge pour les messages non lus (données réelles depuis l'API)
  const hasUnreadMessages = item.name === 'Messages'; 
  const unreadCount = useUnreadCount();

  return (
    <Link
      href={item.link}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
        "hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-25",
        "focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-1",
        isActive 
          ? "bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm" 
          : "text-gray-600 hover:text-primary-700",
        isMobile && "w-full justify-start"
      )}
    >
      {/* Indicateur actif */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-600 rounded-full" />
      )}
      
      <div className="relative">
        <div className={cn(
          "transition-transform duration-200 group-hover:scale-110",
          isActive && "scale-110"
        )}>
          {item.icon}
        </div>
        {/* Badge pour messages non lus */}
        {hasUnreadMessages && unreadCount > 0 && (
          <div className={getBadgeClasses(true)}>
            <span className={NAVBAR_CONSTANTS.BADGE.TEXT}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-medium transition-colors duration-200",
          isActive ? "text-primary-700" : "text-gray-700 group-hover:text-primary-700"
        )}>
          {item.name}
        </span>
        {isMobile && (
          <span className="text-xs text-gray-500 group-hover:text-primary-600">
            {item.description}
          </span>
        )}
      </div>
      
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
};

export default NavigationItem; 