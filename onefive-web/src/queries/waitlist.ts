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

