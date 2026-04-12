import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';

export interface WaitlistStatus {
  status: 'WAITING' | 'ACTIVE';
  position: number;
  referralCode: string;
  firstName: string;
  showInLeaderboard?: boolean;
  referrals: {
    accepted: number;
    pending: number;
    total: number;
  };
  foundingMember: {
    progress: number;
    threshold: number;
    unlocked: boolean;
  };
  badges: Array<{
    type: string;
    name: string;
    awardedAt: string;
  }>;
  activatedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  profileId: string;
  firstName: string;
  lastName: string;
  avatarId: string | null;
  acceptedCount: number;
}

export interface AmbassadorInfo {
  name: string;
  title: string | null;
  bio: string | null;
  interviewUrl: string | null;
  avatarUrl: string | null;
}

export interface ProfileInfo {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
}

/** Single referrer response: ambassador or user. Use for signup banner (one request). */
export type ReferrerByCode =
  | { type: 'AMBASSADOR'; data: AmbassadorInfo }
  | { type: 'USER'; data: ProfileInfo };

export const getReferrerByCode = async (code: string): Promise<ReferrerByCode> => {
  const response = await api.get(`waitlist/referrer/${code}`);
  const responseJson: any = await response.json();
  return responseJson.data;
};

export const getWaitlistStatus = async (): Promise<WaitlistStatus> => {
  try {
    const response = await api.get('waitlist/status');
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    toast.error('Unable to fetch waitlist status');
    throw Error('Unable to fetch waitlist status');
  }
};

export const getWaitlistLeaderboard = async (
  limit: number = 20,
): Promise<LeaderboardEntry[]> => {
  try {
    const response = await api.get(`waitlist/leaderboard?limit=${limit}`);
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    toast.error('Unable to fetch leaderboard');
    throw Error('Unable to fetch leaderboard');
  }
};

export const toggleLeaderboardOptIn = async (): Promise<{ showInLeaderboard: boolean }> => {
  try {
    const response = await api.put('waitlist/leaderboard-opt-in');
    const responseJson: any = await response.json();
    return responseJson.data;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw payloadError;
    }
    toast.error('Unable to update preference');
    throw Error('Unable to update preference');
  }
};

/** Self-activate from waitlist (DEV ONLY, requires NODE_ENV=development on backend) */
export const selfActivateWaitlist = async (): Promise<{ message: string }> => {
  const response = await api.post('waitlist/self-activate');
  const responseJson: any = await response.json();
  return responseJson.data;
};
