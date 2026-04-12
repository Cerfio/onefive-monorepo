import { SetMetadata } from '@nestjs/common';

export const ALLOW_OTP_ONLY_SESSION_KEY = 'allowOtpOnlySession';

export const AllowOtpOnlySession = () =>
  SetMetadata(ALLOW_OTP_ONLY_SESSION_KEY, true);
