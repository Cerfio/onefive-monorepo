import { api } from '@/utils/kyInstance';

export interface UserSettings {
  userId: string;
  email: string;
  phone: string;
  joinedAt: string;
  lastLogin: string;
  accountType: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    connections: boolean;
    mentions: boolean;
    discussions: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    quietHours: boolean;
    weekendNotif: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'network' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    showActivity: boolean;
    searchVisibility: boolean;
    dataProcessing: boolean;
    analyticsSharing: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en' | 'es' | 'de';
    timezone: string;
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: number;
  };
}

export interface UpdateNotificationsDto {
  email?: boolean;
  push?: boolean;
  marketing?: boolean;
  connections?: boolean;
  mentions?: boolean;
  discussions?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly';
  quietHours?: boolean;
  weekendNotif?: boolean;
}

export interface UpdatePrivacyDto {
  profileVisibility?: 'public' | 'network' | 'private';
  showEmail?: boolean;
  showPhone?: boolean;
  allowMessages?: boolean;
  showActivity?: boolean;
  searchVisibility?: boolean;
  dataProcessing?: boolean;
  analyticsSharing?: boolean;
}

export interface UpdatePreferencesDto {
  theme?: 'light' | 'dark' | 'system';
  language?: 'fr' | 'en' | 'es' | 'de';
  timezone?: string;
  dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const settingsApi = {
  // GET /user-settings
  getUserSettings: async (): Promise<UserSettings> => {
    const response = await api.get('user-settings').json<{ success: boolean; data: UserSettings }>();
    return response.data;
  },

  // PUT /user-settings/notifications
  updateNotifications: async (dto: UpdateNotificationsDto): Promise<{ notifications: UserSettings['notifications'] }> => {
    const response = await api.put('user-settings/notifications', { json: dto }).json<{ success: boolean; data: { notifications: UserSettings['notifications'] } }>();
    return response.data;
  },

  // PUT /user-settings/privacy
  updatePrivacy: async (dto: UpdatePrivacyDto): Promise<{ privacy: UserSettings['privacy'] }> => {
    const response = await api.put('user-settings/privacy', { json: dto }).json<{ success: boolean; data: { privacy: UserSettings['privacy'] } }>();
    return response.data;
  },

  // PUT /user-settings/preferences
  updatePreferences: async (dto: UpdatePreferencesDto): Promise<{ preferences: UserSettings['preferences'] }> => {
    const response = await api.put('user-settings/preferences', { json: dto }).json<{ success: boolean; data: { preferences: UserSettings['preferences'] } }>();
    return response.data;
  },

  // PUT /user-settings/password
  updatePassword: async (dto: UpdatePasswordDto): Promise<{ lastPasswordChange: string }> => {
    const response = await api.put('user-settings/password', { json: dto }).json<{ success: boolean; data: { lastPasswordChange: string } }>();
    return response.data;
  },
};

