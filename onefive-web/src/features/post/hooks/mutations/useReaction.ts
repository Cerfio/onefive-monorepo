import { Reaction } from '@/enums';
import { api } from '@/utils/kyInstance';
import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { PostType, tempReactionType } from '../../post.api';

type FeedSnapshot = Array<[QueryKey, unknown]>;

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

export const useReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      reaction,
    }: {
      postId: string;
      reaction: Reaction | null;
    }) => {
      const resolvedPostId = resolvePostId(queryClient, postId);
      return reaction ? reactToPost(resolvedPostId, reaction) : removeReaction(resolvedPostId);
    },
    // Optimistic cache update for responsiveness
    onMutate: async (variables) => {
      const { postId, reaction: nextReaction } = variables;
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
        const prevUserReaction = post.userReaction;
        const reactions: tempReactionType = { ...(post.reactions || {}) } as any;
        const keyMap: Partial<Record<Reaction, keyof tempReactionType>> = {
          THUMBS_UP: 'like',
          HEART: 'love',
          COTILLON: 'support',
          THINKING: 'insightful',
          LAUGH: 'funny',
          ROCKET: 'celebrate',
        } as const;

        const dec = (k?: keyof tempReactionType) => {
          if (!k) return;
          if (reactions[k] && reactions[k]! > 0) {
            reactions[k] = (reactions[k]! - 1) as any;
            if (reactions[k] === 0) delete reactions[k];
          }
        };
        const inc = (k?: keyof tempReactionType) => {
          if (!k) return;
          reactions[k] = ((reactions[k] || 0) + 1) as any;
        };

        if (prevUserReaction == null && nextReaction) {
          // Add reaction
          inc(keyMap[nextReaction]);
          return { ...post, reactions: Object.keys(reactions).length ? reactions : undefined, reactionCount: post.reactionCount + 1, userReaction: nextReaction };
        }
        if (prevUserReaction && nextReaction == null) {
          // Remove reaction
          dec(keyMap[prevUserReaction]);
          return { ...post, reactions: Object.keys(reactions).length ? reactions : undefined, reactionCount: Math.max(0, post.reactionCount - 1), userReaction: null };
        }
        if (prevUserReaction && nextReaction && prevUserReaction !== nextReaction) {
          // Switch reaction
          dec(keyMap[prevUserReaction]);
          inc(keyMap[nextReaction]);
          return { ...post, reactions: Object.keys(reactions).length ? reactions : undefined, userReaction: nextReaction };
        }
        return post;
      };

      // Update single post cache
      if (previousPost) {
        queryClient.setQueryData<PostType>(['post', resolvedPostId], applyUpdate(previousPost));
      }

      // Update all feed caches
      previousFeeds.forEach(([key, data]) => {
        if (!data) return;
        const feed = data as any; // { pages, pageParams } shape for infinite query
        if (feed.pages && Array.isArray(feed.pages)) {
          const newPages = feed.pages.map((page: any) => {
            if (!page?.items) return page;
            return {
              ...page,
              items: page.items.map((p: PostType) => (p.id === resolvedPostId ? applyUpdate(p) : p)),
            };
          });
          queryClient.setQueryData(key as QueryKey, { ...feed, pages: newPages });
        }
      });

      return { previousPost, previousFeeds, resolvedPostId } satisfies {
        previousPost?: PostType;
        previousFeeds?: FeedSnapshot;
        resolvedPostId: string;
      };
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
      queryClient.invalidateQueries({ queryKey: ['post-reactions', resolvedPostId] });
    },
  });
};

const reactToPost = async (postId: string, reaction: Reaction) => {
  // Backend endpoint lives under /post-reactions/posts/:postId
  const response = await api.post(`post-reactions/posts/${postId}`, {
    json: { reaction },
  });
  if (!response.ok) {
    throw new Error('Failed to react to post');
  }
  return response.json();
};

const removeReaction = async (postId: string) => {
  const response = await api.delete(`post-reactions/posts/${postId}`);
  if (!response.ok) {
    throw new Error('Failed to remove reaction');
  }
  return response.json();
};
