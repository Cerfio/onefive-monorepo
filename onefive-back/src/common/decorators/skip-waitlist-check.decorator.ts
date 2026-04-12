import { SetMetadata } from '@nestjs/common';
import { ALLOW_WAITLIST_NOT_ACTIVE_KEY } from './allow-waitlist-not-active.decorator';

export const SKIP_WAITLIST_CHECK_KEY = 'skipWaitlistCheck';

/**
 * Decorator to skip the WaitlistGuard check.
 * Apply on controllers or routes that should be accessible
 * to users with waitlistStatus === 'WAITING' (e.g. auth, profile, referral, waitlist).
 */
export const SkipWaitlistCheck =
  () =>
  (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(SKIP_WAITLIST_CHECK_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(ALLOW_WAITLIST_NOT_ACTIVE_KEY, true)(
      target,
      propertyKey,
      descriptor,
    );
  };
