import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '../../post.api';

// Utility function to resolve post ID (handle temp IDs)
const _resolvePostId = (queryClient: any, postId: string): string => {
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

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // If it's a tempId, we need to resolve it first
      if (postId.startsWith('temp-post-')) {
        throw new Error('Cannot delete post with temporary ID');
      }
      await deletePost(postId);
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous value
      const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

      // Optimistically remove the post from all feed pages
      queryClient.setQueriesData({ queryKey: ['feed'] }, (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page: any) => {
          if (!page?.items) return page;

          return {
            ...page,
            items: page.items.filter((post: any) => post.id !== postId && post.tempId !== postId),
          };
        });

        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Remove from individual post cache
      queryClient.removeQueries({ queryKey: ['post', postId] });

      return { previousFeeds };
    },
    onError: (_err, _postId, context) => {
      // Rollback on error
      if (context?.previousFeeds) {
        context.previousFeeds.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};
