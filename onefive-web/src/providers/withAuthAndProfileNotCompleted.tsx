'use client';

import { selfProfile } from '@/queries/profile';
import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const WithAuthAndProfileNotCompleted = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  // if token is not present, redirect to signin
  if (!getCookie('is_authenticated')) {
    router.push('/signin');
  }

  const selfProfileQuery = useQuery({
    queryKey: ['selfProfile'],
    queryFn: () => selfProfile(),
  });

  if (selfProfileQuery.status === 'error') {
    if (
      (selfProfileQuery.error as any).message ===
      'ProfileOnboardingNotCompletedException'
    ) {
      return <>{children}</>;
    } else if (
      (selfProfileQuery.error as any).message ===
      'ProfileEmailNotVerifiedException'
    ) {
      router.push('/auth/confirm/email');
      toast('Please confirm your email before continuing');
    } else {
      toast.error('Unable to fetch profile: Error ONE-2');
    }
  }
  if (selfProfileQuery.status === 'success') {
    router.push('/feed');
  }
  return null;
};

export default WithAuthAndProfileNotCompleted;
