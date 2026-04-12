'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { useMe } from '@/hooks/useUser';
import { useMeProfile } from '@/queries/profile';

function PostHogIdentify() {
  const { data: user } = useMe();
  const { data: meProfile } = useMeProfile();

  useEffect(() => {
    const distinctId = user?.userId || user?.id;
    if (distinctId) {
      posthog.identify(distinctId, {
        firstName: user?.firstName,
        lastName: user?.lastName,
        profile_id: user?.id,
        ecosystem_roles: meProfile?.ecosystemRoles,
        created_at: meProfile?.createdAt,
        city: meProfile?.city,
        country_code: meProfile?.countryCode,
      });
      posthog.register({
        ecosystem_roles: meProfile?.ecosystemRoles,
        city: meProfile?.city,
        country_code: meProfile?.countryCode,
      });
    }
  }, [user?.userId, user?.id, user?.firstName, user?.lastName, meProfile?.ecosystemRoles, meProfile?.createdAt, meProfile?.city, meProfile?.countryCode]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        persistence: 'cookie',
        cross_subdomain_cookie: true,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        mask_all_text: false,
        mask_all_element_attributes: false,
      });
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
