'use client';

import EmailConfirmed from '@/features/auth/Auth/Confirmation/EmailConfirmed';
import { useEffect, useState } from 'react';

export default function EmailConfirmedPage({ params }: { params: Promise<{ token: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ token: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }

  return <EmailConfirmed params={resolvedParams} />;
}
