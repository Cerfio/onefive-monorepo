/** Referral data in API responses */
export interface ReferralResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for referral stats */
export type ReferralStatsResponseDto = Record<string, unknown>;

/** Response for leaderboard */
export type LeaderboardResponseDto = ReferralResponseDto[];

/** Response for get my referrals */
export type ListMyReferralsResponseDto = ReferralResponseDto[];
