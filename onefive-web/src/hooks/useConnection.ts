import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import posthog from 'posthog-js';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

interface ConnectionStatusResponse {
  requesterId: string;
  accepterId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook pour récupérer le statut de connexion avec un profil
 */
export const useConnectionStatus = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['connection-status', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      try {
        const response = await api.get(`profiles/${profileId}/connection-status`);
        const result = await response.json() as ApiResponse;
        
        if (!result.success || !result.data) {
          return null; // Pas de connexion
        }
        
        return result.data as ConnectionStatusResponse;
      } catch (error: any) {
        // Si HTTPError avec 404, pas de connexion (retourner null)
        if (error.name === 'HTTPError' && error.response?.status === 404) {
          return null;
        }
        // Pour les autres erreurs, les propager
        throw error;
      }
    },
    enabled: !!profileId,
    staleTime: 30 * 1000, // 30 secondes
  });
};

/**
 * Hook pour envoyer une demande de connexion à un profil
 */
export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      try {
        const response = await api.post(`network/connect/${profileId}`);
        const result = await response.json() as ApiResponse;

        if (!result.success) {
          throw new Error(result.error || 'Failed to send connection request');
        }

        return result.data;
      } catch (error: any) {
        // Gérer les erreurs HTTP spécifiques avec ky
        if (error.name === 'HTTPError') {
          const status = error.response.status;
          let errorData: any = {};
          
          try {
            errorData = await error.response.json();
          } catch {
            // Si on ne peut pas parser le JSON, utiliser un message par défaut
          }
          
          if (status === 400) {
            // BadRequest - probablement déjà connecté ou demande en attente
            const message = errorData.message || errorData.error || 'Connection request already exists';
            throw new Error(message);
          }
          
          if (status === 404) {
            throw new Error('Profile not found');
          }
          
          if (status === 500) {
            // Vérifier si c'est une erreur de connexion existante
            const errorMessage = errorData.message || errorData.error || '';
            if (errorMessage.includes('already') || errorMessage.includes('exists') || errorMessage.includes('AlreadyExists')) {
              throw new Error('Connection request already exists');
            }
            throw new Error('Server error');
          }
          
          // Autres erreurs HTTP
          throw new Error(errorData.message || errorData.error || `HTTP ${status} error`);
        }
        
        throw error;
      }
    },
    onSuccess: async (_, profileId) => {
      toast.success('Demande de connexion envoyée avec succès');
      posthog.capture('connection_request_sent');
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileId] });
      // Invalider et refetch les notifications pour que la nouvelle notification apparaisse
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.refetchQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      // Gérer les cas spéciaux
      const errorMessage = error?.message || '';
      if (errorMessage.includes('already') || errorMessage.includes('exists') || errorMessage.includes('pending')) {
        toast.info('Une demande de connexion existe déjà avec cette personne');
      } else {
        toast.error(`Erreur lors de l'envoi de la demande: ${errorMessage}`);
      }
    },
  });
};

/**
 * Hook pour accepter une demande de connexion
 * @param profileId - L'ID du profil qui a envoyé la demande
 */
export const useAcceptConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.post(`network/connect/${profileId}/accept`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to accept connection request');
      }

      return result.data;
    },
    onSuccess: (_, profileId) => {
      toast.success('Connexion acceptée');
      posthog.capture('connection_request_accepted');
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
      queryClient.invalidateQueries({ queryKey: ['profile-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

export const useRejectConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.patch(`profiles/${profileId}/connect/reject`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to reject connection request');
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success('Demande de connexion refusée');
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
      queryClient.invalidateQueries({ queryKey: ['profile-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

/**
 * Hook pour supprimer une connexion
 */
export const useRemoveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.delete(`profiles/${profileId}/connect`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove connection');
      }

      return result.data;
    },
    onSuccess: (_, profileId) => {
      toast.success('Connexion supprimée');
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
      queryClient.invalidateQueries({ queryKey: ['profile-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

/**
 * Hook pour annuler une demande de connexion envoyée
 */
export const useCancelConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.delete(`network/connect/${profileId}/cancel`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel connection request');
      }

      return result.data;
    },
    onSuccess: (_, profileId) => {
      toast.success('Demande de connexion annulée');
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
      queryClient.invalidateQueries({ queryKey: ['profile-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'annulation: ${error.message}`);
    },
  });
};
