import { SetMetadata } from '@nestjs/common';

export const ALLOW_ONBOARDING_NOT_COMPLETE_KEY = 'allowOnboardingNotComplete';

export const AllowOnboardingNotComplete = () =>
  SetMetadata(ALLOW_ONBOARDING_NOT_COMPLETE_KEY, true);
