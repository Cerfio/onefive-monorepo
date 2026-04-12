// Types pour la gestion relationnelle

export interface ProfileTag {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ProfileReminder {
  id: string;
  date: string;
  time: string;
  reason: string;
  profileId: string;
  completed?: boolean;
}

export interface ProfileNote {
  id: string;
  content: string;
  createdAt: string;
  profileId: string;
}

export interface ProfileInteraction {
  id: string;
  type: 'message' | 'like' | 'view' | 'connection' | 'dataroom' | 'discussion';
  date: string;
  description: string;
  profileId: string;
}

export interface RelationshipData {
  profileId: string;
  profileName: string;
  profileAvatar: string;
  tags: string[];
  notes: ProfileNote[];
  reminders: ProfileReminder[];
  interactions: ProfileInteraction[];
}

export interface SmartNotification {
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

// Tags prédéfinis
export const PREDEFINED_TAGS: ProfileTag[] = [
  { id: 'meet', label: 'À rencontrer', icon: '🤝', color: 'blue' },
  { id: 'investor', label: 'Investisseur potentiel', icon: '💰', color: 'green' },
  { id: 'mentor', label: 'Mentor', icon: '📚', color: 'purple' },
  { id: 'partner', label: 'Partenaire stratégique', icon: '🚀', color: 'orange' },
];

// Types pour les actions sur les profils
export interface ProfileActionsProps {
  profileId: string;
  profileName: string;
  isCurrentUser: boolean;
  currentTags?: string[];
  onTagChange?: (tags: string[]) => void;
}

// Types pour les hooks de gestion relationnelle
export interface UseRelationshipManagement {
  tags: string[];
  reminders: ProfileReminder[];
  notes: ProfileNote[];
  interactions: ProfileInteraction[];
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  addReminder: (reminder: Omit<ProfileReminder, 'id'>) => void;
  addNote: (note: Omit<ProfileNote, 'id' | 'createdAt'>) => void;
  markReminderCompleted: (id: string) => void;
  deleteNote: (id: string) => void;
} 