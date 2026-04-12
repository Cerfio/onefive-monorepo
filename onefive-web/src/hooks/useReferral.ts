import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

// Types
export type ReferralTier = 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ReferralStats {
  totalSent: number;
  totalAccepted: number;
  totalPending: number;
  currentTier: ReferralTier;
  rank: number;
  progress: number;
  nextTier: ReferralTier | null;
  referralsToNextTier: number;
  tiers: Array<{
    name: string;
    threshold: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  firstName: string;
  lastName: string;
  avatarId: string | null;
  totalAccepted: number;
  currentTier: ReferralTier;
}

export interface MyReferral {
  id: string;
  invitedEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  acceptedAt: string | null;
  invitedUser: {
    profileId: string;
    firstName: string;
    lastName: string;
    avatarId: string | null;
    highlight: string | null;
    bio: string | null;
    ecosystemRoles: string[];
    countryCode: string | null;
    isFollowing: boolean;
    stats: {
      followers: number;
      following: number;
      posts: number;
    };
  } | null;
}

// Query keys
export const referralKeys = {
  all: ['referral'] as const,
  stats: () => [...referralKeys.all, 'stats'] as const,
  leaderboard: (limit?: number) => [...referralKeys.all, 'leaderboard', limit] as const,
  myReferrals: () => [...referralKeys.all, 'my-referrals'] as const,
};

// Fetch referral stats
async function fetchReferralStats(): Promise<ReferralStats> {
  const response = await api.get('referral/stats');
  const result = await response.json<{ success: boolean; data: ReferralStats }>();
  return result.data;
}

// Fetch leaderboard
async function fetchLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const response = await api.get(`referral/leaderboard?limit=${limit}`);
  const result = await response.json<{ success: boolean; data: LeaderboardEntry[] }>();
  return result.data;
}

// Fetch my referrals
async function fetchMyReferrals(): Promise<MyReferral[]> {
  const response = await api.get('referral/my-referrals');
  const result = await response.json<{ success: boolean; data: MyReferral[] }>();
  return result.data;
}

// Hook: Get referral stats
export function useReferralStats() {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: fetchReferralStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Get leaderboard
export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: referralKeys.leaderboard(limit),
    queryFn: () => fetchLeaderboard(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Get my referrals
export function useMyReferrals() {
  return useQuery({
    queryKey: referralKeys.myReferrals(),
    queryFn: fetchMyReferrals,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
