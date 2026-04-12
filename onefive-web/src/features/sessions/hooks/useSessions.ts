import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSessions, revokeSession } from '../sessions.api';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Session déconnectée avec succès');
        // Invalidate and refetch sessions
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      } else {
        toast.error(data.message || 'Erreur lors de la déconnexion de la session');
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de la déconnexion de la session');
      console.error('Revoke session error:', error);
    },
  });
};
