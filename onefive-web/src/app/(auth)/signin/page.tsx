import { Metadata } from 'next';
import SigninClient from './client';

export const metadata: Metadata = {
  title: 'Sign in, Log in',
};

export default function SigninPage() {
  return <SigninClient />;
}
