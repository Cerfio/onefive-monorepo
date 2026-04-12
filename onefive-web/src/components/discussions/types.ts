// Types pour les nouvelles fonctionnalités avancées
export interface ExtendedAnswer {
  id: string;
  content: string;
  profile: any;
  createdAt: string;
  upvoteCount: number;
  hasUpvote: boolean;
  hasReacted: any[];
  reactions: any[];
  isAuthor: boolean;
  replies?: ExtendedAnswer[];
  parentId?: string;
  depth?: number;
  isEditing?: boolean;
  editContent?: string;
  readingTime?: number;
  engagementScore?: number;
  qualityScore?: number;
  authorBadges?: AuthorBadge[];
}

export interface AuthorBadge {
  type: 'verified' | 'expert' | 'top_contributor' | 'founder' | 'moderator';
  color: string;
  icon: string;
  label: string;
}

export interface VoteState {
  isAnimating: boolean;
  direction: 'up' | 'down' | null;
  count: number;
}

export interface ReactionState {
  [key: string]: {
    count: number;
    users: string[];
    isAnimating: boolean;
  };
}

export interface DiscussionState {
  isBookmarked: boolean;
  isFollowing: boolean;
  readingProgress: number;
  viewTimeStart: number;
  engagement: {
    totalReadTime: number;
    scrollDepth: number;
    interactions: number;
  };
  isDraftSaved: boolean;
  focusMode: boolean;
  keyboardShortcuts: boolean;
}

export interface DraftState {
  content: string;
  lastSaved: Date;
  isAutoSaving: boolean;
  hasUnsavedChanges: boolean;
}

export interface MentionSuggestion {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  verified?: boolean;
} 