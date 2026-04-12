import { api } from '@/utils/kyInstance';

/**
 * OAuth CSRF protection utility.
 * 
 * Uses the backend to generate cryptographically random state tokens
 * stored in the database. The state is validated server-side when
 * the OAuth flow completes, preventing CSRF attacks.
 */

const OAUTH_STATE_KEY = 'oauth_csrf_state';

export type OAuthProvider = 'linkedin' | 'google';

interface OAuthUrlResponse {
  success: boolean;
  data: {
    url: string;
    state: string;
  };
}

/**
 * Get a CSRF-protected OAuth URL from the backend.
 * The backend generates a random state, stores it in DB, and returns the full URL.
 */
export async function getOAuthUrl(provider: OAuthProvider): Promise<string> {
  const response = await api.get(`auth/oauth-url?provider=${provider}`).json<OAuthUrlResponse>();
  
  // Store state in sessionStorage for local reference (backup validation)
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({
    state: response.data.state,
    provider,
    timestamp: Date.now(),
  }));

  return response.data.url;
}

/**
 * Get the stored OAuth state from sessionStorage.
 * Used by the callback page to send state back to the backend for validation.
 */
export function getStoredOAuthState(): { state: string; provider: OAuthProvider } | null {
  const stored = sessionStorage.getItem(OAUTH_STATE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return { state: parsed.state, provider: parsed.provider };
  } catch {
    return null;
  }
}

/**
 * Clear the stored OAuth state after use.
 */
export function clearStoredOAuthState(): void {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

/**
 * Initiate OAuth flow by getting a CSRF-protected URL and redirecting.
 */
export async function initiateOAuth(provider: OAuthProvider): Promise<void> {
  try {
    const url = await getOAuthUrl(provider);
    window.location.href = url;
  } catch (error) {
    console.error(`Failed to initiate ${provider} OAuth:`, error);
    throw error;
  }
}
