// Composants principaux
export { default as SearchBar } from './SearchBar';
export { default as MentionText } from './MentionText';
export { default as NavigationItem } from './NavigationItem';
export { default as UserDropdown } from './UserDropdown';
export { default as NotificationDropdown } from './NotificationDropdown';

// Configuration
export { navigationItems } from './navigationItems';
export { NAVBAR_CONSTANTS, getBadgeClasses, getTransitionClasses } from './constants';

// Composants utilitaires
export { NotificationSkeleton, UserDropdownSkeleton } from './components/NotificationSkeleton';
export { NavbarErrorBoundary, withErrorBoundary } from './components/ErrorBoundary';

// Hooks
export { useNotifications } from './hooks/useNotifications';

// Types
export type * from './types'; 