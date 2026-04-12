import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { selfProfile } from '@/queries/profile';

export const MeSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  avatar: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  highlight: z.string().optional(),
  followedByCount: z.number().optional(),
  streak: z.number().optional(),
  postCount: z.number().optional(),
  connectionCount: z.number().optional(),
});

export type Me = z.infer<typeof MeSchema>;

export const useMe = () => {
  return useQuery(
    ['user'], // queryKey
    async (): Promise<Me> => {
      try {
        const profile = await selfProfile();
        return {
          id: profile.id,
          userId: profile.userId,
          avatar: profile.avatar,
          firstName: profile.firstName,
          lastName: profile.lastName,
          highlight: profile.highlight,
          followedByCount: profile.count?.followedBy,
          streak: profile.streak,
          postCount: profile.count?.posts,
          connectionCount: profile.count?.following, // "following" représente les connexions/abonnements
        };
      } catch (error: any) {
        if (error.name === 'ZodError') {
          toast.error('Impossible de charger votre profil. Veuillez réessayer.');
        } else {
          toast.error('Impossible de charger votre profil. Vérifiez votre connexion.');
        }
        throw error;
      }
    },
    {
      retry: false,
      staleTime: 1000 * 30, // Réduit à 30 secondes pour être plus réactif aux changements
      cacheTime: 1000 * 60 * 5, // Garde en cache pendant 5 minutes
      refetchOnWindowFocus: true, // Refetch quand on revient sur la fenêtre
    }
  );
};
