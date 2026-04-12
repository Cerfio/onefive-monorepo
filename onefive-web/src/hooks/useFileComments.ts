import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFileComments,
  createFileComment,
  updateFileComment,
  deleteFileComment,
  type FileComment,
} from '@/queries/dataroom-comments';
import { useMeProfile } from '@/queries/profile';

interface UseFileCommentsProps {
  dataroomId: string;
  fileId: string;
  pageFilter?: number;
}

export const useFileComments = ({ dataroomId, fileId, pageFilter }: UseFileCommentsProps) => {
  const queryClient = useQueryClient();
  const queryKey = ['file-comments', dataroomId, fileId] as const;

  const { data: meProfile } = useMeProfile({ enabled: true });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getFileComments({ dataroomId, fileId }),
    enabled: !!dataroomId && !!fileId,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createFileComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      if (meProfile) {
        const optimisticComment: FileComment = {
          id: `optimistic-${Date.now()}`,
          content: variables.content,
          pageNumber: variables.pageNumber ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: meProfile.id,
            firstName: meProfile.firstName,
            lastName: meProfile.lastName,
            avatar: meProfile.avatar ? { url: meProfile.avatar } : null,
          },
          replies: [],
        };

        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          if (variables.parentId) {
            return {
              ...old,
              comments: old.comments.map((c: FileComment) =>
                c.id === variables.parentId
                  ? { ...c, replies: [...c.replies, optimisticComment] }
                  : c
              ),
              total: old.total + 1,
            };
          }
          return {
            ...old,
            comments: [...old.comments, optimisticComment],
            total: old.total + 1,
          };
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFileComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((c: FileComment) => {
            if (c.id === variables.commentId) {
              return { ...c, content: variables.content, updatedAt: new Date().toISOString() };
            }
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === variables.commentId
                  ? { ...r, content: variables.content, updatedAt: new Date().toISOString() }
                  : r
              ),
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFileComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments
            .filter((c: FileComment) => c.id !== variables.commentId)
            .map((c: FileComment) => ({
              ...c,
              replies: c.replies.filter((r) => r.id !== variables.commentId),
            })),
          total: Math.max(0, old.total - 1),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  let comments: FileComment[] = data?.comments ?? [];

  if (pageFilter !== undefined) {
    comments = comments.filter(
      (c) => c.pageNumber === null || c.pageNumber === pageFilter,
    );
  }

  const addComment = (content: string, pageNumber?: number, parentId?: string) => {
    return createMutation.mutateAsync({
      dataroomId,
      fileId,
      content,
      pageNumber,
      parentId,
    });
  };

  const editComment = (commentId: string, content: string) => {
    return updateMutation.mutateAsync({
      dataroomId,
      fileId,
      commentId,
      content,
    });
  };

  const removeComment = (commentId: string) => {
    return deleteMutation.mutateAsync({
      dataroomId,
      fileId,
      commentId,
    });
  };

  return {
    comments,
    total: data?.total ?? 0,
    isLoading,
    addComment,
    editComment,
    removeComment,
    isCreating: createMutation.isPending,
    currentProfileId: meProfile?.id,
  };
};
