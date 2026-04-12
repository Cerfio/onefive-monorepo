'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import { SignupWallModal } from '@/components/seo/SignupWallModal';

const DiscussionFullView = dynamic(
  () =>
    import('@/components/discussions/DiscussionFullView').then(
      (mod) => mod.DiscussionFullView,
    ),
  { ssr: false },
);

export function DiscussionAuthSwitch({
  discussionId,
  children,
}: {
  discussionId: string;
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
    return <DiscussionFullView discussionId={discussionId} />;
  }

  return (
    <>
      {children}
      <SignupWallModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
