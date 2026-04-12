'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import { SignupWallModal } from '@/components/seo/SignupWallModal';

const StartupFullView = dynamic(
  () =>
    import('@/components/startup/StartupFullView').then(
      (mod) => mod.StartupFullView,
    ),
  { ssr: false },
);

export function StartupAuthSwitch({
  startupId,
  children,
}: {
  startupId: string;
  children: React.ReactNode;
}) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const auth = !!getCookie('is_authenticated');
    setIsAuth(auth);
    if (!auth) setShowModal(true);
  }, []);

  if (isAuth === null) return <>{children}</>;

  if (isAuth) {
    return <StartupFullView startupId={startupId} />;
  }

  return (
    <>
      {children}
      <SignupWallModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
