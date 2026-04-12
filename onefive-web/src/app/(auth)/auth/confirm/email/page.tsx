import EmailToConfirm from '@/features/auth/Auth/Confirmation/EmailToConfirm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Confirm your email',
};

export default function EmailToConfirmPage() {
  return (
    <Suspense>
      <EmailToConfirm />
    </Suspense>
  );
}
