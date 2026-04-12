import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePostComment } from '../../post.api';

interface EditCommentData {
  content: string;
}

export const useEditComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: EditCommentData }) => {
      return updatePostComment(commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};