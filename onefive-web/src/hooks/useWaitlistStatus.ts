import { useQuery } from '@tanstack/react-query';
import { getWaitlistStatus, WaitlistStatus } from '@/queries/waitlist';

/**
 * Hook to check waitlist status and provide utilities for UI guards.
 *
 * Usage:
 * ```tsx
 * const { isActive, isWaiting, isLoading } = useWaitlistStatus();
 *
 * if (isWaiting) {
 *   return <WaitlistBanner />;
 * }
 * ```
 */
export const useWaitlistStatus = () => {
  const query = useQuery<WaitlistStatus, Error>(
    ['waitlistStatus'],
    getWaitlistStatus,
    {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes - status doesn't change often
      cacheTime: 1000 * 60 * 10, // 10 minutes cache
      refetchOnWindowFocus: true, // Refetch when user comes back
    },
  );

  const status = query.data?.status;

  return {
    // Query state
    ...query,

    // Convenience booleans
    isActive: status === 'ACTIVE',
    isWaiting: status === 'WAITING',

    // Full status for detailed info
    status,
    waitlistData: query.data,

    // Position and referral info
    position: query.data?.position,
    referralCode: query.data?.referralCode,
    referrals: query.data?.referrals,
    foundingMember: query.data?.foundingMember,
  };
};

/**
 * Hook that returns true if user can perform actions (ACTIVE status).
 * Returns false while loading to prevent UI flash.
 *
 * Usage:
 * ```tsx
 * const canCreatePost = useCanPerformActions();
 *
 * <Button disabled={!canCreatePost}>Create Post</Button>
 * ```
 */
export const useCanPerformActions = () => {
  const { isActive, isLoading } = useWaitlistStatus();

  // While loading, assume they can't (safer default)
  if (isLoading) return false;

  return isActive;
};

export default useWaitlistStatus;
