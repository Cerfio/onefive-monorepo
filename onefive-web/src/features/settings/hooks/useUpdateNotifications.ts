import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UpdateNotificationsDto, UserSettings } from '../settings.api';
import { toast } from 'sonner';

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateNotificationsDto) => settingsApi.updateNotifications(dto),
    onMutate: async (dto) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['user-settings'] });

      // Snapshot de l'ancienne valeur
      const previousSettings = queryClient.getQueryData<UserSettings>(['user-settings']);

      // Mise à jour optimiste
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(['user-settings'], {
          ...previousSettings,
          notifications: {
            ...previousSettings.notifications,
            ...dto,
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.push !== undefined && { push: dto.push }),
            ...(dto.marketing !== undefined && { marketing: dto.marketing }),
            ...(dto.connections !== undefined && { connections: dto.connections }),
            ...(dto.mentions !== undefined && { mentions: dto.mentions }),
            ...(dto.discussions !== undefined && { discussions: dto.discussions }),
            ...(dto.frequency !== undefined && { frequency: dto.frequency }),
            ...(dto.quietHours !== undefined && { quietHours: dto.quietHours }),
            ...(dto.weekendNotif !== undefined && { weekendNotif: dto.weekendNotif }),
          },
        });
      }

      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousSettings) {
        queryClient.setQueryData(['user-settings'], context.previousSettings);
      }
      toast.error('Erreur lors de la mise à jour des notifications');
    },
    onSuccess: () => {
      toast.success('Notifications mises à jour avec succès');
    },
    onSettled: () => {
      // Refetch pour être sûr d'avoir les données à jour
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

