'use client';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import {
  createPost,
  CreatePostType,
  PostDisplayReason,
} from '../../post.api';
import { useMe } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { selfProfile } from '@/queries/profile';
import type { FeedResponse } from '../../hooks/queries/useFeed';
import type { OptimisticPostType } from '../../types/optimistic';
import type { PostType } from '../../post.api';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  // Récupérer le profil complet avec l'avatar
  const { data: profile } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
    staleTime: 1000 * 30, // 30 secondes
  });

  type MutationContext = {
    tempId: string;
    previousFeeds: ReturnType<typeof queryClient.getQueriesData>;
  };

  return useMutation<any, unknown, CreatePostType, MutationContext>({
    mutationFn: (data: CreatePostType) => createPost(data),
    onMutate: async (newPostData) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

      const tempId = `temp-post-${Date.now()}`;
      const optimisticPost: OptimisticPostType = {
        id: tempId,
        tempId,
        content: newPostData.content,
        mediaUrls:
          newPostData.medias?.map((file) => ({
            url: URL.createObjectURL(file),
            mimeType: file.type,
            fileName: file.name,
            size: file.size,
          })) || [],
        tags: newPostData.tags,
        reactions: {
          like: 0,
          love: 0,
          support: 0,
          insightful: 0,
          funny: 0,
          celebrate: 0,
        },
        reactionCount: 0,
        commentCount: 0,
        repostCount: 0,
        isReposted: false,
        isBookmarked: false,
        userReaction: null,
        displayReason: PostDisplayReason.YOUR_POST,
        author: {
          id: profile?.id ?? user?.id ?? 'pending-user',
          name:
            `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim() ||
            'Pending user',
          about: profile?.highlight ?? user?.highlight ?? '',
          avatar: profile?.avatar ?? user?.avatar ?? '',
          streak: profile?.streak ?? user?.streak,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPending: true,
      };

      queryClient.setQueriesData<InfiniteData<FeedResponse>>({ queryKey: ['feed'] }, (oldData) => {
        const data = oldData as InfiniteData<FeedResponse> | undefined;
        if (!data || !data.pages?.length) return data;

        const updatedPages = data.pages.map((page, index) => {
          if (index === 0) {
            return { ...page, items: [optimisticPost, ...page.items] };
          }
          return page;
        });

        return { ...data, pages: updatedPages } as InfiniteData<FeedResponse>;
      });

      return { tempId, previousFeeds } satisfies MutationContext;
    },

    onSuccess: (rawResponse, _variables, context) => {
      // The backend wraps the payload in { success, data }
      const responseData = rawResponse?.data ?? rawResponse;
      const { id, createdAt, updatedAt, mediaUrls } = responseData;

      // S'assurer que les dates sont valides
      const safeCreatedAt = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
      const safeUpdatedAt = updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString();

      const actualPost: PostType = {
        id,
        author: {
          id: profile?.id ?? user?.id ?? 'pending-user',
          name: `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim() || 'Pending user',
          about: profile?.highlight ?? user?.highlight ?? '',
          avatar: profile?.avatar ?? user?.avatar ?? '',
          streak: profile?.streak ?? user?.streak,
        },
        content: _variables.content,
        mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
        tags: _variables.tags,
        reactions: { like: 0, love: 0, support: 0, insightful: 0, funny: 0, celebrate: 0 },
        reactionCount: 0,
        commentCount: 0,
        repostCount: 0,
        isReposted: false,
        isBookmarked: false,
        userReaction: null,
        displayReason: PostDisplayReason.YOUR_POST,
        createdAt: safeCreatedAt,
        updatedAt: safeUpdatedAt,
      };

      queryClient.setQueriesData<InfiniteData<FeedResponse>>({ queryKey: ['feed'] }, (oldData) => {
        const data = oldData as InfiniteData<FeedResponse> | undefined;
        if (!data) return data;

        if (!data.pages.length) {
          return {
            ...data,
            pages: [
              {
                items: [actualPost],
                page: 1,
                pageSize: 5,
                hasMore: true,
              },
            ],
          } as InfiniteData<FeedResponse>;
        }

        let hasReplaced = false;

        const updatedPages = data.pages.map((page, index) => {
          const updatedItems = page.items.map((post) => {
            if ((post as OptimisticPostType).tempId === context?.tempId) {
              hasReplaced = true;
              return actualPost;
            }
            return post;
          });

          if (index === 0 && !hasReplaced) {
            return { ...page, items: [actualPost, ...updatedItems] };
          }

          return { ...page, items: updatedItems };
        });

        return { ...data, pages: updatedPages } as InfiniteData<FeedResponse>;
      });

      posthog.capture('post_created');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
    onSettled: (_result, error, _variables, context) => {
      if (error && context?.previousFeeds) {
        context.previousFeeds.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        return;
      }

      // Delayed invalidation so the server has time to index the new post
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['feed'] });
      }, 5000);
    },
  });
};
