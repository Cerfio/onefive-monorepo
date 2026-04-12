import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchDiscussions, DiscussionInfer } from '@/queries/discussion';
import { Sort } from '@/enums';

export const useProfileDiscussions = (profileId: string, limit: number = 5) => {
  return useInfiniteQuery({
    queryKey: ['profile-discussions', profileId, limit],
    queryFn: async ({ pageParam = 0 }): Promise<DiscussionInfer[]> => {
      const discussions = await fetchDiscussions({
        sort: Sort.NEWEST,
        offset: pageParam as number,
        limit,
        profileId,
      });
      return discussions;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Si la dernière page contient moins d'éléments que la limite, il n'y a plus de pages
      if (lastPage.length < limit) {
        return undefined;
      }
      // Sinon, retourner l'offset pour la prochaine page
      return allPages.length * limit;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!profileId, // Ne charge que si profileId est défini
  });
};

