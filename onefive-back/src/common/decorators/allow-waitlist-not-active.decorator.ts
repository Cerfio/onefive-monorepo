import { SetMetadata } from '@nestjs/common';

export const ALLOW_WAITLIST_NOT_ACTIVE_KEY = 'allowWaitlistNotActive';

export const AllowWaitlistNotActive = () =>
  SetMetadata(ALLOW_WAITLIST_NOT_ACTIVE_KEY, true);
