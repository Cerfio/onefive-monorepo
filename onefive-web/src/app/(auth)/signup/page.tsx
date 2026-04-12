import { Metadata } from 'next';
import Signup from '@/features/auth/Signup';
import WithoutAuth from '@/providers/withoutAuth';
import AuthLayout from '@/features/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Sign up, Register',
};

export default function SignupPage() {
  return (
    <WithoutAuth>
      <AuthLayout>
        <Signup />
      </AuthLayout>
    </WithoutAuth>
  );
}
