import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { Reaction } from '@/enums';

interface CommentReactionArgs {
  postId: string;
  commentId: string;
  reaction: Reaction | null;
}

export const useCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reaction }: CommentReactionArgs) => {
      if (reaction === null) {
        const res = await api.delete(`post-comment-reactions/comments/${commentId}`);
        if (!res.ok) throw new Error('Failed to remove comment reaction');
        return res.json();
      }
      const res = await api.post(`post-comment-reactions/comments/${commentId}`, {
        json: { reaction },
      });
      if (!res.ok) throw new Error('Failed to react to comment');
      return res.json();
    },
    onSettled: (_data, _err, variables) => {
      // resync comments for that post
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
};
