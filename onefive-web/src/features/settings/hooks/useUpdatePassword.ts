import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UpdatePasswordDto } from '../settings.api';
import { toast } from 'sonner';

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePasswordDto) => settingsApi.updatePassword(dto),
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success('Mot de passe mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

