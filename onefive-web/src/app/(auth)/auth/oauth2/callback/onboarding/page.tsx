import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Oauth2CallbackPageClient from '../client';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'LinkedIn onboarding',
};

const Oauth2OnboardingCallbackPageServer = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  if (!resolvedSearchParams.code || typeof resolvedSearchParams.code !== 'string') {
    redirect('/onboarding');
  }

  // Passer le state comme 'linkedin_onboarding' pour que le client détecte l'onboarding
  return (
    <Oauth2CallbackPageClient
      state="linkedin_onboarding"
      code={resolvedSearchParams.code as string}
    />
  );
};

export default Oauth2OnboardingCallbackPageServer;

