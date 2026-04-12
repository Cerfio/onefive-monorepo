'use client';

import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

const WithoutAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const isAuthenticated = getCookie('is_authenticated');

  // Redirect to feed if user is already logged in
  if (isAuthenticated) {
    router.push('/feed');
  } else {
    return children;
  }
};

export default WithoutAuth;
