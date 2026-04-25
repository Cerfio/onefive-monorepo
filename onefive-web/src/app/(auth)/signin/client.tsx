'use client';

import WithoutAuth from '@/providers/withoutAuth';
import Signin from '@/features/auth/Signin';
import AuthLayout from '@/features/auth/AuthLayout';
import { useSearchParams } from 'next/navigation';

export default function SigninClient() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/feed';

  return (
    <WithoutAuth>
      <AuthLayout>
        <Signin returnUrl={returnUrl} />
      </AuthLayout>
    </WithoutAuth>
  );
}
