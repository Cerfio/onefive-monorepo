import { api } from '@/utils/kyInstance';

export interface SessionItem {
  id: string;
  deviceInfo: string;
  location: string;
  ipAddress: string;
  userAgent: string;
  lastUsage: string;
  createdAt: string;
  isCurrentSession: boolean;
}

export interface SessionsResponse {
  sessions: SessionItem[];
  total: number;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

export const getSessions = async (): Promise<SessionsResponse> => {
  const response = await api.get('sessions').json<{ success: boolean; data: SessionsResponse }>();
  return response.data;
};

export const revokeSession = async (sessionId: string): Promise<RevokeSessionResponse> => {
  const response = await api.delete(`sessions/${sessionId}`).json<{ success: boolean; data: RevokeSessionResponse }>();
  return response.data;
};
