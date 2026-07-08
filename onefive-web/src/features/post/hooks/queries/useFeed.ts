import { useInfiniteQuery } from '@tanstack/react-query';
import { Tags } from '@/enums';
import { PostType } from '../../post.api';
import { getFeed } from '../../post.api';

export interface FeedResponse {
  items: PostType[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const useFeed = (limit: number = 5, tags?: Tags[]) => {
  return useInfiniteQuery({
    queryKey: ['feed', limit, (tags ?? []).slice().sort().join(',')],
    queryFn: async ({ pageParam = 0 }): Promise<FeedResponse> => {
      const response: any = await getFeed({ skip: pageParam, limit, tags });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      // Garde-fou : si la dernière page n'apporte aucun post réellement nouveau
      // (que des doublons déjà en cache), on considère qu'on est au bout. Empêche
      // toute boucle de requêtes même si le backend renvoyait des pages identiques.
      const previousIds = new Set<string>();
      for (let i = 0; i < allPages.length - 1; i++) {
        for (const post of allPages[i].items) previousIds.add(post.id);
      }
      const addsNewPosts = lastPage.items.some(
        (post) => !previousIds.has(post.id),
      );
      if (!addsNewPosts) return undefined;
      return lastPage.page * lastPage.pageSize;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};
