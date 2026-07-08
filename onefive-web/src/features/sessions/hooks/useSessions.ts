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

/**
 * Révoque plusieurs sessions d'un coup (ex : "déconnecter tous les autres
 * appareils"). Tolère les échecs partiels et n'émet qu'un seul toast + une
 * invalidation, contrairement à useRevokeSession qui toaste par appel.
 */
export const useRevokeSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionIds: string[]) => {
      const results = await Promise.allSettled(
        sessionIds.map((id) => revokeSession(id)),
      );
      const failed = results.filter(
        (r) =>
          r.status === 'rejected' ||
          (r.status === 'fulfilled' && !r.value.success),
      ).length;
      return { total: sessionIds.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      const ok = total - failed;
      if (ok > 0) {
        toast.success(
          `${ok} session${ok > 1 ? 's' : ''} déconnectée${ok > 1 ? 's' : ''}`,
        );
      }
      if (failed > 0) {
        toast.error(
          `${failed} session${failed > 1 ? 's' : ''} n'ont pas pu être déconnectée${failed > 1 ? 's' : ''}`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: () => {
      toast.error('Erreur lors de la déconnexion des sessions');
    },
  });
};
