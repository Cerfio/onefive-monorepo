import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

// Types
export interface ProfileSuggestion {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  highlight?: string;
  followersCount: number;
  isFollowed: boolean;
  ecosystemRoles: string[];
  skills: string[];
  countryCode?: string;
}

export interface StartupSuggestion {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  categories: string[];
  countryCode: string;
  city: string;
  membersCount: number;
  followersCount: number;
  isFollowed: boolean;
}

export interface ProfileStatistics {
  postsViewed: number;
  engagement: number;
  connections: number;
  level: number;
  experience: number;
  streak: number;
  postsCreated: number;
  totalReactions: number;
  totalComments: number;
}

export interface BookmarkedPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  bookmarkedAt: string;
  tags: string[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  mediaUrls: string[];
}

// API functions
const getProfileSuggestions = async (limit = 10, skip = 0): Promise<ProfileSuggestion[]> => {
  const response = await api.get(`profile-suggestion?limit=${limit}&skip=${skip}`);
  const data: any = await response.json();
  return data.data;
};

const getStartupSuggestions = async (limit = 10, skip = 0): Promise<StartupSuggestion[]> => {
  const response = await api.get(`startup-suggestion?limit=${limit}&skip=${skip}`);
  const data: any = await response.json();
  return data.data;
};

const getProfileStatistics = async (): Promise<ProfileStatistics> => {
  const response = await api.get('profile-statistics');
  const data: any = await response.json();
  return data.data;
};

const getBookmarks = async (limit = 10, skip = 0): Promise<BookmarkedPost[]> => {
  const response = await api.get(`post-bookmark?limit=${limit}&skip=${skip}`);
  const data: any = await response.json();
  return data.data;
};

// Utility function to resolve post ID (handle temp IDs)
const resolvePostId = (queryClient: any, postId: string): string => {
  if (!postId.startsWith('temp-post-')) {
    return postId;
  }

  // Look for the post in feed cache to find the real ID
  const feedData = queryClient.getQueriesData({ queryKey: ['feed'] });
  for (const [, data] of feedData) {
    const feed = data as any;
    if (feed?.pages) {
      for (const page of feed.pages) {
        if (page?.items) {
          const post = page.items.find((p: any) =>
            p.tempId === postId || p.id === postId
          );
          if (post && post.id && !post.id.startsWith('temp-post-')) {
            return post.id;
          }
        }
      }
    }
  }

  return postId; // Fallback to original ID if not found
};

const toggleBookmark = async (postId: string): Promise<{ bookmarked: boolean }> => {
  // Note: This function doesn't have access to queryClient, so we can't resolve temp IDs here
  // The resolution should be done in the hook that calls this function
  const response = await api.put(`post-bookmark/toggle/${postId}`);
  const data: any = await response.json();
  return data.data;
};

// These functions are now handled by the useFollow hooks

// Hooks
export const useProfileSuggestions = (limit = 10, skip = 0) => {
  return useQuery({
    queryKey: ['profile-suggestions', limit, skip],
    queryFn: () => getProfileSuggestions(limit, skip),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStartupSuggestions = (limit = 10, skip = 0) => {
  return useQuery({
    queryKey: ['startup-suggestions', limit, skip],
    queryFn: () => getStartupSuggestions(limit, skip),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProfileStatistics = () => {
  return useQuery({
    queryKey: ['profile-statistics'],
    queryFn: getProfileStatistics,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBookmarks = (limit = 10, skip = 0) => {
  return useQuery({
    queryKey: ['bookmarks', limit, skip],
    queryFn: () => getBookmarks(limit, skip),
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const resolvedPostId = resolvePostId(queryClient, postId);
      return toggleBookmark(resolvedPostId);
    },
    onSuccess: () => {
      // Invalidate bookmarks queries
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

// These hooks are now imported from useFollow.ts
export { useToggleProfileFollow, useToggleStartupFollow } from './useFollow';