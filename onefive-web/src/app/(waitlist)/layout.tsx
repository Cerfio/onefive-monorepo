'use client';

import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WaitlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  // Simple auth check - redirect to signin if not authenticated
  useEffect(() => {
    if (!getCookie('is_authenticated')) {
      router.push('/signin');
    }
  }, [router]);

  if (!getCookie('is_authenticated')) {
    return null;
  }

  return <>{children}</>;
}
