'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateConversation } from '@/hooks/useMessaging';
import { toast } from 'sonner';

/**
 * Hook partagé pour créer (ou retrouver) une conversation directe
 * avec un profil et rediriger vers la page Messages.
 *
 * Utilisé par :
 * - UserMiniProfile (via onMessage)
 * - ProfileActions (bouton "Envoyer un message")
 */
export const useNavigateToConversation = () => {
  const router = useRouter();
  const createConversation = useCreateConversation();
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);

  const navigateToConversation = useCallback(
    async (profileId: string) => {
      if (!profileId) return;

      setLoadingProfileId(profileId);
      try {
        const result = await createConversation.mutateAsync({
          participantIds: [profileId],
          type: 'DIRECT',
        });

        router.push(`/messages?conversationId=${result.id}`);
      } catch {
        // Error toast is already handled by useCreateConversation hook
      } finally {
        setLoadingProfileId(null);
      }
    },
    [createConversation, router],
  );

  return {
    navigateToConversation,
    isLoading: createConversation.isPending,
    loadingProfileId,
  };
};
