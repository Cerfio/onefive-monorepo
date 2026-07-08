'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import { SignupWallModal } from '@/components/seo/SignupWallModal';
import { FeedFilterProvider } from '@/contexts/FeedFilterContext';

const PostFullView = dynamic(
  () =>
    import('@/app/(public)/post/[id]/PostFullView').then(
      (mod) => mod.PostFullView,
    ),
  { ssr: false },
);

export function FeedAuthSwitch({
  postId,
  children,
}: {
  postId: string;
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
    return (
      <FeedFilterProvider>
        <PostFullView postId={postId} />
      </FeedFilterProvider>
    );
  }

  return (
    <>
      {children}
      <SignupWallModal open={showModal} onOpenChange={setShowModal} context="feed" />
    </>
  );
}
