'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy path-based confirmation route.
 *
 * The confirmation email links to `/auth/confirm/email?code=...` (see the
 * backend email-verification service). This route used to render a hardcoded
 * "email confirmed" screen that never actually verified the token. It now
 * forwards the path token into the real `?code=` verification flow so any
 * stray link still verifies instead of showing a fake success.
 */
export default function EmailConfirmTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    params.then(({ token }) => {
      router.replace(`/auth/confirm/email?code=${encodeURIComponent(token)}`);
    });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Redirection…
    </div>
  );
}
