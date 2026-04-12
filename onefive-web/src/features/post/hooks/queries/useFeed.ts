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
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page * lastPage.pageSize;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};
