'use client';

import { selfProfile } from '@/queries/profile';
import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import StreakProvider from './StreakProvider';

const WithAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  // if token is not present, redirect to signin
  useEffect(() => {
    if (!getCookie('is_authenticated')) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/feed';
      router.push(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [router]);

  const selfProfileQuery = useQuery({
    queryKey: ['selfProfile'],
    queryFn: () => selfProfile(),
    enabled: !!getCookie('is_authenticated'), // Only run query if authenticated
  });

  // Redirect to onboarding if profile is not completed or email is not verified
  useEffect(() => {
    if (selfProfileQuery.status === 'error') {
      if (
        (selfProfileQuery.error as any).message ===
        'ProfileOnboardingNotCompletedException'
      ) {
        toast.info('Please complete your profile before continuing');
        router.push('/onboarding');
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
  }, [selfProfileQuery.status, selfProfileQuery.error, router]);

  // Don't render if no token
  if (!getCookie('is_authenticated')) {
    return null;
  }

  // Don't render if there's an error (redirect is handled in useEffect)
  if (selfProfileQuery.status === 'error') {
    return null;
  }

  // Only render children when query is successful
  if (selfProfileQuery.status === 'success') {
    return (
      <StreakProvider>
        {children}
      </StreakProvider>
    );
  }

  // Loading state
  return null;
};

export default WithAuth;
