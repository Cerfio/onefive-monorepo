import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UpdatePreferencesDto, UserSettings } from '../settings.api';
import { toast } from 'sonner';

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePreferencesDto) => settingsApi.updatePreferences(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: ['user-settings'] });
      const previousSettings = queryClient.getQueryData<UserSettings>(['user-settings']);

      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(['user-settings'], {
          ...previousSettings,
          preferences: {
            ...previousSettings.preferences,
            ...dto,
          },
        });
      }

      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['user-settings'], context.previousSettings);
      }
      toast.error('Erreur lors de la mise à jour des préférences');
    },
    onSuccess: () => {
      toast.success('Préférences mises à jour avec succès');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

