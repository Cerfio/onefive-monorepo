import { SetMetadata } from '@nestjs/common';

export const ALLOW_EMAIL_NOT_VERIFIED_KEY = 'allowEmailNotVerified';

export const AllowEmailNotVerified = () =>
  SetMetadata(ALLOW_EMAIL_NOT_VERIFIED_KEY, true);
