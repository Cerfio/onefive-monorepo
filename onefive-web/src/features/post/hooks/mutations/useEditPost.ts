import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { updatePost } from '../../post.api';
import type { FeedResponse } from '../queries/useFeed';

const resolvePostId = (queryClient: any, postId: string): string => {
  if (!postId.startsWith('temp-post-')) {
    return postId;
  }

  const feedData = queryClient.getQueriesData({ queryKey: ['feed'] });
  for (const [, data] of feedData) {
    const feed = data as any;
    if (feed?.pages) {
      for (const page of feed.pages) {
        if (page?.items) {
          const post = page.items.find(
            (p: any) => p.tempId === postId || p.id === postId,
          );
          if (post && post.id && !post.id.startsWith('temp-post-')) {
            return post.id;
          }
        }
      }
    }
  }

  return postId;
};

interface EditPostType {
  postId: string;
  content?: string;
  tags?: string[];
}

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditPostType) => {
      const { postId, ...updateData } = data;
      const resolvedPostId = resolvePostId(queryClient, postId);
      return updatePost(resolvedPostId, updateData);
    },
    onSuccess: (_, variables) => {
      const resolvedPostId = resolvePostId(queryClient, variables.postId);

      queryClient.invalidateQueries({
        queryKey: ['post', resolvedPostId],
      });

      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: ['feed'] },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedPages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((post: any) => {
              if (post.id === resolvedPostId) {
                return {
                  ...post,
                  content: variables.content ?? post.content,
                  tags: variables.tags ?? post.tags,
                  updatedAt: new Date().toISOString(),
                };
              }
              return post;
            }),
          }));

          return { ...oldData, pages: updatedPages } as InfiniteData<FeedResponse>;
        },
      );
    },
  });
};
