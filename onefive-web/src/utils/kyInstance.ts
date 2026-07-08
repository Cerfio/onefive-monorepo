import ky, { type NormalizedOptions } from 'ky';
import { deleteCookie } from 'cookies-next';

// Handle common HTTP errors across all API calls
async function handleResponseErrors(
  request: Request,
  options: NormalizedOptions,
  response: Response,
) {
  // 401 Unauthorized - Session expired or not authenticated
  // Skip redirect when 401 comes from login/signup (let the form show the error)
  if (response.status === 401) {
    const url = typeof request.url === 'string' ? request.url : '';
    const isAuthAttempt = url.includes('auth/signin') || url.includes('auth/signup');
    if (!isAuthAttempt) {
      deleteCookie('is_authenticated');
      window.location.href = '/signin';
    }
    return response;
  }

  // 403 Forbidden - Redirect based on guard exception
  if (response.status === 403) {
    try {
      const clonedResponse = response.clone();
      const body = await clonedResponse.json();
      const message = (body?.error?.message ?? body?.message ?? '').toLowerCase();

      // Guard redirect mapping: exception/message pattern → redirect path
      const guardRedirects: Array<{
        match: (msg: string) => boolean;
        redirect: string;
        skipRedirect?: () => boolean;
      }> = [
        {
          match: (msg) =>
            msg.includes('profileemailnotverifiedexception') || msg.includes('email not verified'),
          redirect: '/auth/confirm/email',
        },
        {
          match: (msg) =>
            msg.includes('profileonboardingnotcompletedexception') || msg.includes('onboarding not completed'),
          redirect: '/onboarding',
          // Don't redirect if already on onboarding (let error propagate for WithAuthAndProfileNotCompleted)
          skipRedirect: () =>
            typeof window !== 'undefined' && window.location.pathname.startsWith('/onboarding'),
        },
        {
          match: (msg) =>
            msg.includes('otponlysessionrestrictedexception') || msg.includes('otp only session'),
          redirect: '/auth/confirm/email',
        },
      ];

      for (const { match, redirect, skipRedirect } of guardRedirects) {
        if (match(message)) {
          if (skipRedirect?.()) {
            break; // Let error propagate to the caller
          }
          window.location.href = redirect;
          return response;
        }
      }
    } catch {
      // If we can't parse the response, just return it
    }
  }

  return response;
}

const kyInstance = ky.create({
  retry: 0,
  credentials: 'include',
  hooks: {
    beforeRequest: [],
    afterResponse: [handleResponseErrors],
  },
});

export default kyInstance;

export const api = ky.create({
  retry: 0,
  prefixUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  credentials: 'include',
  hooks: {
    afterResponse: [handleResponseErrors],
  },
});
