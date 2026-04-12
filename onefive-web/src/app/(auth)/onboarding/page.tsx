import { Metadata } from 'next';
import Onboarding from '@/features/auth/Onboarding';
import OnboardingContextProvider from '@/features/auth/Onboarding/OnboardingContext';
import WithAuthAndProfileNotCompleted from '@/providers/withAuthAndProfileNotCompleted';

export const metadata: Metadata = {
  title: 'Onboarding',
};

export default function OnboardingPage() {
  return (
    <WithAuthAndProfileNotCompleted>
      <OnboardingContextProvider>
        <Onboarding />
      </OnboardingContextProvider>
    </WithAuthAndProfileNotCompleted>
  );
}
