import { useCallback } from 'react';
import { useToggleProfileFollow, useToggleStartupFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';
import { useNetworkActions } from './useNetworkApi';

export const useInteractionHandlers = () => {
  const profileFollow = useToggleProfileFollow();
  const startupFollow = useToggleStartupFollow();
  const networkActions = useNetworkActions();

  const handleConnect = useCallback(async (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await networkActions.sendConnectionRequest(id);
      toast.success(`Demande de connexion envoyée à ${name}`);
    } catch {
      // L'erreur est déjà gérée par le mutation (toast.error dans useNetworkActions)
    }
  }, [networkActions]);

  const handleFollow = useCallback((id: string, isFollowing: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    profileFollow.toggle(id, isFollowing);
  }, [profileFollow]);

  const handleFollowStartup = useCallback((id: string, isFollowing: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startupFollow.toggle(id, isFollowing);
  }, [startupFollow]);

  const notifyFiltersCleared = () => {
    toast('Filtres effacés');
  };

  return {
    connectedProfiles: new Set<string>(),
    pendingOutgoing: new Set<string>(),
    pendingIncoming: new Set<string>(),
    followedProfiles: new Set<string>(),
    followedStartups: new Set<string>(),
    handleConnect,
    handleFollow,
    handleFollowStartup,
    notifyFiltersCleared
  };
};