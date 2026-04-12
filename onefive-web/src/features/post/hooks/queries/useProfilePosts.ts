import { useInfiniteQuery } from '@tanstack/react-query';
import { getProfilePosts } from '../../post.api';
import { tempReactionType } from '../../post.api';

export interface ProfilePostItem {
  id: string;
  author: {
    id: string;
    name: string;
    about: string;
    highlight: string | null;
    avatar: string;
    streak?: number;
    countryCode: string | null;
    ecosystemRoles?: string[];
    createdAt?: string;
    followers?: number;
    following?: number;
    posts?: number;
    isFollowing?: boolean;
  };
  content: string;
  mediaUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reactions?: tempReactionType;
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  isReposted: boolean;
  isBookmarked: boolean;
  userReaction: string | null;
  displayReason: string;
  viewsCount?: number;
}

export interface ProfilePostsResponse {
  items: ProfilePostItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const useProfilePosts = (profileId: string, take: number = 5) => {
  return useInfiniteQuery({
    queryKey: ['profile-posts', profileId, take],
    queryFn: async ({ pageParam = 0 }): Promise<ProfilePostsResponse> => {
      const response: any = await getProfilePosts(profileId, {
        skip: pageParam,
        take,
        orderBy: 'createdAt',
        order: 'desc',
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page * lastPage.pageSize;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    enabled: !!profileId,
  });
};

