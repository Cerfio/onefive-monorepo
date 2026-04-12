import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { capitalizeFirstLetter } from '@/utils/stringFormatter';
import Oauth2CallbackPageClient from './client';

const oauth2Authorized = ['linkedin', 'linkedin_sync', 'google', 'apple'];

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Extract the provider name from the state parameter.
 * State can be either a simple provider name (legacy) or a hex token (new CSRF-protected flow).
 * For the new flow, the provider is determined from sessionStorage on the client side.
 */
function extractProviderFromState(state: string): string | null {
  // Legacy format: state is the provider name directly
  if (oauth2Authorized.includes(state)) {
    return state;
  }
  // New CSRF format: state is a hex token — provider will be resolved client-side
  if (/^[0-9a-f]{32,}$/i.test(state)) {
    return 'csrf_token';
  }
  return null;
}

export async function generateMetadata({ params: _params, searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const state = resolvedSearchParams.state as string;
  if (state && typeof state === 'string') {
    const provider = extractProviderFromState(state);
    if (provider && provider !== 'csrf_token') {
      return {
        title: `${capitalizeFirstLetter(
          state === 'linkedin_sync' ? 'linkedin' : state,
        )} authentication`,
      };
    }
    if (provider === 'csrf_token') {
      return { title: 'Authentication' };
    }
  }
  return {
    title: 'Unknown authentication',
  };
}

const Oauth2CallbackPageServer = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const state = resolvedSearchParams.state as string;

  if (!state || typeof state !== 'string') {
    redirect('/signin');
  }

  const provider = extractProviderFromState(state);
  if (!provider) {
    redirect('/signin');
  }

  return (
    <Oauth2CallbackPageClient
      state={state}
      code={resolvedSearchParams.code as string}
    />
  );
};

export default Oauth2CallbackPageServer;
