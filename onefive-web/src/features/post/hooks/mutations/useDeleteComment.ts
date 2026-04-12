import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePostComment } from '../../post.api';

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      return deletePostComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};