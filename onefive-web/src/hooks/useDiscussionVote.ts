import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUpvoteDiscussion, deleteUpvoteDiscussion, SpecificDiscussionInfer } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import { toast } from 'sonner';

interface UseDiscussionVoteProps {
  discussionId: string;
  initialUpvoted: boolean;
  initialUpvoteCount: number;
}

export const useDiscussionVote = ({ discussionId, initialUpvoted, initialUpvoteCount }: UseDiscussionVoteProps) => {
  const queryClient = useQueryClient();
  const selfProfile = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
  
  // États pour le système de vote animé
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countTrend, setCountTrend] = useState(0);

  // Mise à jour des états initiaux quand les données changent
  useEffect(() => {
    setIsUpvoted(initialUpvoted);
    setUpvoteCount(initialUpvoteCount);
  }, [initialUpvoted, initialUpvoteCount]);

  const { mutateAsync: createUpvoteDiscussionMutation } = useMutation({
    mutationFn: () => {
      return createUpvoteDiscussion({
        id: discussionId,
      });
    },
    onSuccess: (_data) => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId: selfProfile?.id ?? null }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              hasUpvote: true,
              upvoteCount: cache.upvoteCount + 1,
            };
          }
          return cache;
        },
      );
    },
    onError: (_error) => {
      // Rollback en cas d'erreur
      setIsUpvoted(false);
      setUpvoteCount(prev => prev - 1);
      toast.error('Erreur lors du vote');
    }
  });

  const { mutateAsync: deleteUpvoteDiscussionMutation } = useMutation({
    mutationFn: () => {
      return deleteUpvoteDiscussion({
        id: discussionId,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId: selfProfile?.id ?? null }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              hasUpvote: false,
              upvoteCount: cache.upvoteCount - 1,
            };
          }
          return cache;
        },
      );
    },
    onError: (_error) => {
      // Rollback en cas d'erreur
      setIsUpvoted(true);
      setUpvoteCount(prev => prev + 1);
      toast.error('Erreur lors de la suppression du vote');
    }
  });

  const handleVote = async () => {
    if (isAnimating) return;
    
    // Capturer l'état actuel avant modification
    const wasUpvoted = isUpvoted;
    
    setIsAnimating(true);
    setIsUpvoted(!wasUpvoted);
    
    // Délai pour l'effet casino - le compteur change après les particules
    setTimeout(async () => {
      const newTrend = wasUpvoted ? -1 : 1;
      setCountTrend(newTrend);
      setUpvoteCount(prev => wasUpvoted ? prev - 1 : prev + 1);
      
      // API calls
      try {
        if (wasUpvoted) {
          await deleteUpvoteDiscussionMutation();
        } else {
          await createUpvoteDiscussionMutation();
        }
      } catch (error) {
        // Les erreurs sont déjà gérées dans les handlers onError des mutations
        console.error('Vote error:', error);
      }
    }, 100);
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 500);
  };

  return {
    isUpvoted,
    upvoteCount,
    isAnimating,
    countTrend,
    handleVote
  };
}; 