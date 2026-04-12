import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UpdatePrivacyDto, UserSettings } from '../settings.api';
import { toast } from 'sonner';

export const useUpdatePrivacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePrivacyDto) => settingsApi.updatePrivacy(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: ['user-settings'] });
      const previousSettings = queryClient.getQueryData<UserSettings>(['user-settings']);

      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(['user-settings'], {
          ...previousSettings,
          privacy: {
            ...previousSettings.privacy,
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
      toast.error('Erreur lors de la mise à jour de la confidentialité');
    },
    onSuccess: () => {
      toast.success('Confidentialité mise à jour avec succès');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

