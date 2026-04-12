'use client';

import Image from 'next/image';
import Spinner from '@/components/ui/spinner';
import LinkedInIcon from '@/icons/society/LinkedIn.svg';
import GoogleIcon from '@/icons/society/Google.svg';
import AppleIcon from '@/icons/society/Apple.svg';
import { useMutation } from '@tanstack/react-query';
import { linkedinAuthentication, linkedinSync } from '@/queries/auth';
import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/utils/kyInstance';
import { getStoredOAuthState, clearStoredOAuthState } from '@/utils/oauth-csrf';
import posthog from 'posthog-js';

/** Known legacy state values that are provider names directly */
const LEGACY_STATES = ['linkedin', 'linkedin_sync', 'google', 'apple', 'linkedin_onboarding'];

const Oauth2CallbackPageClient = ({
  state,
  code,
}: {
  state: string;
  code: string;
}) => {
  const router = useRouter();
  const _searchParams = useSearchParams();

  // Resolve the provider: either from legacy state or from sessionStorage (CSRF flow)
  const resolvedProvider = useMemo(() => {
    if (LEGACY_STATES.includes(state)) {
      return state; // Legacy flow: state IS the provider name
    }
    // New CSRF flow: state is a hex token, provider is in sessionStorage
    const stored = getStoredOAuthState();
    if (stored) {
      clearStoredOAuthState();
      return stored.provider;
    }
    return null;
  }, [state]);

  const isOnboarding = resolvedProvider === 'linkedin_onboarding';
  
  const findImage = (name: string | null) => {
    switch (name) {
      case 'linkedin':
      case 'linkedin_sync':
      case 'linkedin_onboarding':
        return LinkedInIcon;
      case 'google':
        return GoogleIcon;
      case 'apple':
        return AppleIcon;
      default:
        return LinkedInIcon;
    }
  };

  const { mutateAsync: linkedinMutation } = useMutation({
    mutationFn: () => {
      return linkedinAuthentication({ code, state });
    },
    onSuccess: (data) => {
      posthog.capture('oauth_callback_success', { provider: 'linkedin' });
      toast.success('Linkedin authentication success');
      // Stocker temporairement pour l'onboarding uniquement (nettoyé après usage)
      const info = data.additionalInfo;
      if (info) {
        sessionStorage.setItem('language', info.language);
        sessionStorage.setItem('firstname', info.firstName);
        sessionStorage.setItem('lastname', info.lastName);
        sessionStorage.setItem('country', info.country);
        if (info.pictureUrl) sessionStorage.setItem('pictureUrl', info.pictureUrl);
      }
      // ✅ Le cookie httpOnly est maintenant setté côté serveur (protection XSS)
      setTimeout(() => {
        router.push('/feed');
      }, 3000);
    },
    onError: (_error) => {
      toast.error('Linkedin authentication error');
      router.push('/signin');
    },
  });

  const { mutateAsync: linkedinSyncMutation } = useMutation({
    mutationFn: () => {
      return linkedinSync({ code });
    },
    onSuccess: (data) => {
      toast.success('Données LinkedIn récupérées !');
      
      // Stocker les données de comparaison dans sessionStorage pour le modal
      sessionStorage.setItem('linkedin_sync_data', JSON.stringify(data));
      
      // Rediriger vers le profil avec le paramètre pour ouvrir le modal
      const profileId = sessionStorage.getItem('linkedin_sync_profile_id');
      const redirectUrl = profileId 
        ? `/profile/${profileId}?linkedin_sync=ready`
        : '/profile/current_user?linkedin_sync=ready';
      
      // Nettoyer le sessionStorage (sauf linkedin_sync_data)
      sessionStorage.removeItem('linkedin_sync_intent');
      sessionStorage.removeItem('linkedin_sync_profile_id');
      
      router.push(redirectUrl);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.status === 429
        ? 'Vous devez attendre 24h entre chaque synchronisation'
        : 'Erreur lors de la récupération des données LinkedIn';
      toast.error(errorMessage);
      
      // Nettoyer le sessionStorage
      sessionStorage.removeItem('linkedin_sync_intent');
      sessionStorage.removeItem('linkedin_sync_profile_id');
      
      router.push('/profile/current_user');
    },
  });

  const { mutateAsync: linkedinOnboardingMutation } = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        'linkedin-sync/onboarding',
        {
          json: { code },
          timeout: 150000, // 2 minutes 30 secondes pour le scraping LinkedIn
        }
      ).json();
      return response;
    },
    onSuccess: (response: any) => {
      toast.success('Données LinkedIn récupérées !');
      
      // Stocker les données dans sessionStorage pour le flux onboarding
      // Si requiresManualUrl est présent, on stocke tout l'objet, sinon on stocke les données
      const dataToStore = response.requiresManualUrl ? response : response.data;
      sessionStorage.setItem('linkedInOnboardingData', JSON.stringify(dataToStore));
      
      // Rediriger vers l'onboarding avec un flag
      router.push('/onboarding?linkedin=true');
    },
    onError: (_error: any) => {
      toast.error('Erreur lors de la récupération des données LinkedIn');
      
      // Rediriger vers l'onboarding normal
      router.push('/onboarding');
    },
  });

  const { mutateAsync: googleMutation } = useMutation({
    mutationFn: async () => {
      const response = await api.post('auth/google', {
        json: { code, state },
      }).json<any>();
      return response;
    },
    onSuccess: () => {
      posthog.capture('oauth_callback_success', { provider: 'google' });
      toast.success('Google authentication success');
      setTimeout(() => {
        router.push('/feed');
      }, 3000);
    },
    onError: (_error) => {
      toast.error('Google authentication error');
      router.push('/signin');
    },
  });

  useEffect(() => {
    if (!resolvedProvider) {
      toast.error('Erreur d\'authentification : état OAuth invalide');
      router.push('/signin');
      return;
    }

    // Vérifier si c'est pour l'onboarding
    if (isOnboarding) {
      linkedinOnboardingMutation();
      return;
    }
    
    // Vérifier si c'est une synchronisation LinkedIn
    const isLinkedInSync = resolvedProvider === 'linkedin_sync' || 
                          (resolvedProvider === 'linkedin' && sessionStorage.getItem('linkedin_sync_intent') === 'true');
    
    if (isLinkedInSync) {
      linkedinSyncMutation();
    } else if (resolvedProvider === 'linkedin') {
      linkedinMutation();
    } else if (resolvedProvider === 'google') {
      googleMutation();
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-8">
      <div className="w-20 h-20 relative flex flex-col justify-center items-center">
        <Spinner />
        <Image
          className="absolute"
          src={findImage(resolvedProvider)}
          alt={`${resolvedProvider || 'oauth'} icon`}
          width={28}
          height={28}
        />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">
          {isOnboarding ? 'Récupération de vos données LinkedIn...' : 
           resolvedProvider === 'linkedin_sync' ? 'Synchronisation avec LinkedIn...' : 
           'Authentification en cours...'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Veuillez patienter pendant que nous traitons votre demande.
        </p>
      </div>
    </div>
  );
};

export default Oauth2CallbackPageClient;
