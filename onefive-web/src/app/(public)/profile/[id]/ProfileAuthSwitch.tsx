'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import { SignupWallModal } from '@/components/seo/SignupWallModal';
import { useMeProfile } from '@/queries/profile';

const ProfileFullView = dynamic(
  () =>
    import('@/components/profile/ProfileFullView').then(
      (mod) => mod.ProfileFullView,
    ),
  { ssr: false },
);

export function ProfileAuthSwitch({
  profileId,
  children,
}: {
  profileId: string;
  children: React.ReactNode;
}) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const { data: meProfile } = useMeProfile({ enabled: isAuth === true });

  useEffect(() => {
    const auth = !!getCookie('is_authenticated');
    setIsAuth(auth);
    if (!auth) setShowModal(true);
  }, []);

  useEffect(() => {
    if (meProfile && meProfile.id === profileId) {
      router.replace('/profile/current_user');
    }
  }, [meProfile, profileId, router]);

  if (isAuth === null) return <>{children}</>;

  if (isAuth) {
    // Si c'est notre propre profil, on attend la redirection (évite un flash)
    if (meProfile && meProfile.id === profileId) return <>{children}</>;
    return <ProfileFullView profileId={profileId} />;
  }

  return (
    <>
      {children}
      <SignupWallModal open={showModal} onOpenChange={setShowModal} context="profile" />
    </>
  );
}
