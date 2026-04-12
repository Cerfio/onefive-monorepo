// Constantes pour la navbar
export const NAVBAR_CONSTANTS = {
  // Badge styles
  BADGE: {
    SIZE: 'w-4 h-4',
    BACKGROUND: 'bg-red-500',
    TEXT: 'text-white text-[10px] font-medium',
    POSITION: 'absolute -top-1 -right-1',
    POSITION_TIGHT: 'absolute -top-4 left-24',
    ROUNDED: 'rounded-full',
    CENTER: 'flex items-center justify-center',
  },
  
  // Transition styles
  TRANSITIONS: {
    ALL: 'transition-all duration-200',
    COLORS: 'transition-colors duration-200',
    TRANSFORM: 'transition-transform duration-200',
    OPACITY: 'transition-opacity duration-300',
  },
  
  // Common hover states
  HOVER: {
    SCALE: 'hover:scale-110',
    PRIMARY_BG: 'hover:bg-primary-50',
    GRAY_BG: 'hover:bg-gray-50',
    RING: 'hover:ring-primary-300',
  },
  
  // Focus states
  FOCUS: {
    RING: 'focus:ring-2 focus:ring-primary-200',
    OUTLINE: 'focus:outline-none',
  },
  
  // Default counts (0 = no fake badges when API is unavailable)
  DEFAULTS: {
    UNREAD_MESSAGES: 0,
    NOTIFICATIONS: {
      ENGAGEMENT: 0,
      INVITATIONS: 0,
      SYSTEM: 0,
    },
  },
} as const;

// Helper function pour les badges
export const getBadgeClasses = (tight = false) => {
  const position = tight ? NAVBAR_CONSTANTS.BADGE.POSITION_TIGHT : NAVBAR_CONSTANTS.BADGE.POSITION;
  return `${position} ${NAVBAR_CONSTANTS.BADGE.SIZE} ${NAVBAR_CONSTANTS.BADGE.BACKGROUND} ${NAVBAR_CONSTANTS.BADGE.ROUNDED} ${NAVBAR_CONSTANTS.BADGE.CENTER}`;
};

// Helper function pour les transitions
export const getTransitionClasses = (...types: Array<keyof typeof NAVBAR_CONSTANTS.TRANSITIONS>) => {
  return types.map(type => NAVBAR_CONSTANTS.TRANSITIONS[type]).join(' ');
}; 