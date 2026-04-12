import { useInfiniteQuery } from '@tanstack/react-query';
import { CommentListType } from '../../definitions/comment.definition';
import { getPostComments } from '../../post.api';

export const usePostComments = (
  postId: string,
  enabled: boolean,
  isPostPage?: boolean,
) => {
  return useInfiniteQuery(
    ['comments', postId, isPostPage ? 'full' : 'preview'],
    ({ pageParam = 0 }) =>
      fetchComments(postId, pageParam, isPostPage ? undefined : 3),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasMore ? allPages.length : undefined;
      },
      enabled: enabled && !!postId,
      staleTime: 2 * 60 * 1000,
    },
  );
};

const fetchComments = async (
  postId: string,
  page: number = 0,
  limit: number = 3,
): Promise<CommentPost> => {
  const skip = page * limit;

  const response: any = await getPostComments(postId, {
    skip,
    take: limit,
    orderBy: 'createdAt',
    order: 'desc',
  });

  // L'API retourne { success: true, data: comments[] }
  const comments = response.data || [];

  // Déterminer s'il y a plus de commentaires
  const hasMore = comments.length === limit;

  return {
    comments,
    hasMore,
    total: comments.length, // Note: on ne peut pas connaître le total exact sans une requête séparée
  };
};

type CommentPost = {
  comments: CommentListType;
  hasMore: boolean;
  total: number;
};
