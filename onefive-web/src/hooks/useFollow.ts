import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import posthog from 'posthog-js';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface FollowProfileData {
  profileId: string;
}

interface FollowStartupData {
  startupId: string;
}

export const useFollowProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FollowProfileData) => {
      try {
        const response = await api.post('follows/profiles', {
          json: data,
        });
        const result = await response.json() as ApiResponse;

        if (!result.success) {
          throw new Error(result.error || 'Failed to follow profile');
        }

        return result.data;
      } catch (error: any) {
        // Si le follow existe déjà, ne pas considérer comme une erreur
        if (error?.message?.includes('already exists') || error?.response?.status === 400) {
          return { alreadyFollowing: true };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (!data?.alreadyFollowing) {
        toast.success('Vous suivez maintenant ce profil');
        posthog.capture('profile_followed');
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      // Ne pas afficher d'erreur pour "already exists"
      if (!error?.message?.includes('already exists')) {
        toast.error(`Erreur: ${error.message}`);
      }
    },
  });
};

export const useUnfollowProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.delete(`follows/profiles/${profileId}`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to unfollow profile');
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success('Vous ne suivez plus ce profil');
      posthog.capture('profile_unfollowed');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

export const useFollowStartup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FollowStartupData) => {
      const response = await api.post('follows/startups', {
        json: data,
      });
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to follow startup');
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success('Vous suivez maintenant cette startup');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['startup-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['network-startups'] });
      queryClient.invalidateQueries({ queryKey: ['startup'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

export const useUnfollowStartup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startupId: string) => {
      const response = await api.delete(`follows/startups/${startupId}`);
      const result = await response.json() as ApiResponse;

      if (!result.success) {
        throw new Error(result.error || 'Failed to unfollow startup');
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success('Vous ne suivez plus cette startup');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['startup-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['profile-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['network-startups'] });
      queryClient.invalidateQueries({ queryKey: ['startup'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};

// Combined hook for toggling follow status
export const useToggleProfileFollow = () => {
  const followProfile = useFollowProfile();
  const unfollowProfile = useUnfollowProfile();

  const toggle = (profileId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      unfollowProfile.mutate(profileId);
    } else {
      followProfile.mutate({ profileId });
    }
  };

  return {
    toggle,
    isLoading: followProfile.isPending || unfollowProfile.isPending,
    error: followProfile.error || unfollowProfile.error,
  };
};

export const useToggleStartupFollow = () => {
  const followStartup = useFollowStartup();
  const unfollowStartup = useUnfollowStartup();

  const toggle = (startupId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      unfollowStartup.mutate(startupId);
    } else {
      followStartup.mutate({ startupId });
    }
  };

  return {
    toggle,
    isLoading: followStartup.isPending || unfollowStartup.isPending,
    error: followStartup.error || unfollowStartup.error,
  };
};
