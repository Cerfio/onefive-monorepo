import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnswer, SpecificDiscussionInfer } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import { toast } from 'sonner';

interface UseDiscussionCommentProps {
  discussionId: string;
}

export const useDiscussionComment = ({ discussionId }: UseDiscussionCommentProps) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { mutateAsync: createAnswerMutation, isPending } = useMutation({
    mutationFn: () => {
      return createAnswer({
        content: comment,
        discussionId: discussionId,
      });
    },
    onSuccess: (payload) => {
      const selfProfile = queryClient.getQueryData([
        'selfProfile',
      ]) as selfProfileType;
      
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId: selfProfile?.id ?? null }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            const newAnswer = {
              id: payload.id,
              isAuthor: true,
              content: comment,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              creatorId: selfProfile.id,
              hasUpvote: false,
              upvoteCount: 0,
              hasReacted: [],
              reactions: [],
              replies: [],
              profile: {
                id: selfProfile.id,
                firstName: selfProfile.firstName,
                lastName: selfProfile.lastName,
                avatar: selfProfile.avatar,
                createdAt: selfProfile.createdAt,
                highlight: selfProfile.highlight,
                followedBy: selfProfile.count.followedBy,
              },
            };

            return {
              ...cache,
              answerCount: cache.answerCount + 1,
              answers: [newAnswer, ...cache.answers],
            } as SpecificDiscussionInfer;
          }
          return cache;
        },
      );
      setComment('');
      toast.success('Réponse publiée avec succès');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la publication de la réponse');
    }
  });

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }
    
    await createAnswerMutation();
  };

  return {
    comment,
    setComment,
    handleSubmitComment,
    isPending
  };
}; 