import { api } from '@/utils/kyInstance';
import { useMutation, useQueryClient, QueryKey, InfiniteData } from '@tanstack/react-query';
import { PostType, PostDisplayReason } from '../../post.api';
import { useMe } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { selfProfile } from '@/queries/profile';
import type { FeedResponse } from '../../hooks/queries/useFeed';

type FeedSnapshot = Array<[QueryKey, unknown]>;

const isTempId = (id: string) => id.startsWith('temp-');

// Utility function to resolve post ID (handle temp IDs)
const resolvePostId = (queryClient: any, postId: string): string => {
  if (!isTempId(postId)) {
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
          if (post && post.id && !isTempId(post.id)) {
            return post.id;
          }
        }
      }
    }
  }

  return postId; // Fallback to original ID if not found
};

// Find a post in the feed cache by ID
const findPostInCache = (queryClient: any, postId: string): PostType | null => {
  const feedData = queryClient.getQueriesData({ queryKey: ['feed'] });
  for (const [, data] of feedData) {
    const feed = data as any;
    if (feed?.pages) {
      for (const page of feed.pages) {
        if (page?.items) {
          const post = page.items.find((p: any) => p.id === postId);
          if (post) return post;
        }
      }
    }
  }
  return null;
};

export const useRepost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  const { data: profile } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
    staleTime: 1000 * 30,
  });

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content?: string }) => {
      const resolvedPostId = resolvePostId(queryClient, postId);
      return createRepost(resolvedPostId, content);
    },
    onMutate: async (variables) => {
      const { postId, content } = variables;
      const resolvedPostId = resolvePostId(queryClient, postId);

      // Cancel outgoing fetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['feed'] }),
        queryClient.cancelQueries({ queryKey: ['post', resolvedPostId] }),
      ]);

      // Snapshot previous cache
      const previousPost = queryClient.getQueryData<PostType>(['post', resolvedPostId]);
      const previousFeeds = queryClient.getQueriesData(['feed']);

      const applyUpdate = (post: PostType): PostType => {
        return {
          ...post,
          isReposted: true,
          repostCount: post.repostCount + 1,
        };
      };

      // Update single post cache
      if (previousPost) {
        queryClient.setQueryData<PostType>(['post', resolvedPostId], applyUpdate(previousPost));
      }

      // Update all feed caches — increment counter on original post + inject repost at top
      const originalPost =
        findPostInCache(queryClient, resolvedPostId) ??
        previousPost ??
        null;
      const optimisticRepostId = `temp-repost-${Date.now()}`;

      previousFeeds.forEach(([key, data]) => {
        if (!data) return;
        const feed = data as any;
        if (feed.pages && Array.isArray(feed.pages)) {
          const newPages = feed.pages.map((page: any, index: number) => {
            if (!page?.items) return page;

            // Update counters on original post
            let updatedItems = page.items.map((p: PostType) =>
              p.id === resolvedPostId ? applyUpdate(p) : p,
            );

            // Inject optimistic repost at top of first page
            if (index === 0) {
              const optimisticRepost: PostType = {
                id: optimisticRepostId,
                author: {
                  id: profile?.id ?? user?.id ?? '',
                  name: `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim(),
                  about: profile?.highlight ?? user?.highlight ?? '',
                  avatar: profile?.avatar ?? user?.avatar ?? '',
                  streak: profile?.streak ?? user?.streak,
                },
                content: content || '',
                mediaUrls: [],
                tags: [],
                reactions: undefined,
                reactionCount: 0,
                commentCount: 0,
                repostCount: 0,
                isReposted: false,
                isBookmarked: false,
                userReaction: null,
                displayReason: PostDisplayReason.YOUR_POST,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                repostedPost: originalPost
                  ? {
                      id: originalPost.id,
                      author: {
                        id: originalPost.author.id,
                        name: originalPost.author.name,
                        avatar: originalPost.author.avatar,
                      },
                      content: originalPost.content,
                      mediaUrls: originalPost.mediaUrls,
                      tags: originalPost.tags,
                      createdAt: originalPost.createdAt,
                    }
                  : null,
              };
              updatedItems = [optimisticRepost, ...updatedItems];
            }

            return { ...page, items: updatedItems };
          });
          queryClient.setQueryData(key as QueryKey, { ...feed, pages: newPages });
        }
      });

      return { previousPost, previousFeeds, resolvedPostId, optimisticRepostId } satisfies {
        previousPost?: PostType;
        previousFeeds?: FeedSnapshot;
        resolvedPostId: string;
        optimisticRepostId: string;
      };
    },
    onSuccess: (response, variables, context) => {
      const payload = response?.data ?? response;
      const repostId = payload?.id as string | undefined;
      if (!repostId || !context?.optimisticRepostId) return;

      const safeCreatedAt = payload?.createdAt
        ? new Date(payload.createdAt).toISOString()
        : new Date().toISOString();
      const safeUpdatedAt = payload?.updatedAt
        ? new Date(payload.updatedAt).toISOString()
        : new Date().toISOString();

      const originalPost =
        findPostInCache(queryClient, context.resolvedPostId) ??
        queryClient.getQueryData<PostType>(['post', context.resolvedPostId]) ??
        null;

      const actualRepost: PostType = {
        id: repostId,
        author: {
          id: profile?.id ?? user?.id ?? '',
          name: `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim(),
          about: profile?.highlight ?? user?.highlight ?? '',
          avatar: profile?.avatar ?? user?.avatar ?? '',
          streak: profile?.streak ?? user?.streak,
        },
        content: variables.content || '',
        mediaUrls: [],
        tags: [],
        reactions: undefined,
        reactionCount: 0,
        commentCount: 0,
        repostCount: 0,
        isReposted: false,
        isBookmarked: false,
        userReaction: null,
        displayReason: PostDisplayReason.YOUR_POST,
        createdAt: safeCreatedAt,
        updatedAt: safeUpdatedAt,
        repostedPost: originalPost
          ? {
              id: originalPost.id,
              author: {
                id: originalPost.author.id,
                name: originalPost.author.name,
                avatar: originalPost.author.avatar,
              },
              content: originalPost.content,
              mediaUrls: originalPost.mediaUrls,
              tags: originalPost.tags,
              createdAt: originalPost.createdAt,
            }
          : null,
      };

      queryClient.setQueriesData<InfiniteData<FeedResponse>>({ queryKey: ['feed'] }, (oldData) => {
        const data = oldData as InfiniteData<FeedResponse> | undefined;
        if (!data) return data;

        let replaced = false;
        const updatedPages = data.pages.map((page, index) => {
          const updatedItems = page.items.map((post) => {
            if (post.id === context.optimisticRepostId) {
              replaced = true;
              return actualRepost;
            }
            return post;
          });

          if (index === 0 && !replaced) {
            return { ...page, items: [actualRepost, ...updatedItems] };
          }
          return { ...page, items: updatedItems };
        });

        return { ...data, pages: updatedPages } as InfiniteData<FeedResponse>;
      });
    },
    onError: (_err, variables, context) => {
      if (!context) return;
      const resolvedPostId = context.resolvedPostId ?? resolvePostId(queryClient, variables.postId);
      // Rollback single post
      if (context.previousPost) {
        queryClient.setQueryData(['post', resolvedPostId], context.previousPost);
      }
      // Rollback feeds
      if (context.previousFeeds) {
        context.previousFeeds.forEach(([key, data]) => {
          queryClient.setQueryData(key as QueryKey, data);
        });
      }
    },
    onSettled: (_data, _error, { postId }) => {
      const resolvedPostId = resolvePostId(queryClient, postId);
      queryClient.invalidateQueries({ queryKey: ['post', resolvedPostId] });
    },
  });
};

async function createRepost(postId: string, content?: string) {
  const response = await api.post(`posts/${postId}/repost`, {
    json: content ? { content } : {},
  });
  if (!response.ok) {
    throw new Error('Failed to repost');
  }
  return response.json();
}
