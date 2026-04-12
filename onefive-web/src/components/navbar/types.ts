import React from 'react';

// Types de base pour la navigation
export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  link: string;
  description: string;
}

// Props pour les composants
export interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isMobile?: boolean;
}

export interface SearchBarProps extends React.ComponentProps<'input'> {
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

// Types pour les notifications
export interface NotificationItem {
  id: string;
  type: 'engagement' | 'invitation' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationCounts {
  engagement: number;
  invitations: number;
  system: number;
}

// Types pour les mentions
export interface MentionPart {
  type: 'mention';
  content: string;
  username: string;
}

export interface TextPart {
  type: 'text';
  content: string;
}

export type ParsedMentionPart = MentionPart | TextPart;

export interface MentionTextProps {
  text: string;
}

// Types pour les dropdowns
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  company?: string;
  isPro: boolean;
}

export interface Startup {
  id: string;
  name: string;
  role: string;
  logo?: string;
}

export interface Dataroom {
  id: string;
  name: string;
  documentCount: number;
  visibility: 'public' | 'private' | 'shared';
}

// Props pour les hooks
export interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Types d'événements
export type NotificationCategory = 'engagement' | 'invitations' | 'system';

export type NavbarEvent =
  | { type: 'NOTIFICATION_READ'; payload: { id: string } }
  | { type: 'NOTIFICATION_MARK_ALL_READ' }
  | { type: 'SEARCH_FOCUS' }
  | { type: 'MOBILE_MENU_TOGGLE'; payload: { isOpen: boolean } };

// Types pour l'état global
export interface NavbarState {
  isMobileMenuOpen: boolean;
  isSearchFocused: boolean;
  notifications: NotificationItem[];
  user: UserProfile | null;
} 