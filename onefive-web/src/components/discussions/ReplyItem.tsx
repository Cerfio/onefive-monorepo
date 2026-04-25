import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Triangle, MoreHorizontal, Pencil, Trash2, Flag } from 'lucide-react';
import { ReportModal } from '@/components/modals/ReportModal';
import { reactions } from '@/constant';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Button } from '@/components/base/buttons/button';
import DiscussionMiniProfile from '@/components/discussions/DiscussionMiniProfile';
import { SpecificDiscussionInfer, createReactionReply, deleteReactionReply, createUpvoteReply, deleteUpvoteReply, updateReply, deleteReply } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import { Reaction } from '@/enums';
import NumberFlow from '@number-flow/react';
import { useFormatter } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TextArea } from '@/components/base/textarea/textarea';

type ReplyType = SpecificDiscussionInfer['answers'][0]['replies'][0];

interface ReplyItemProps {
  reply: ReplyType;
  discussionId: string;
  answerId: string;
  viewerId: string | null;
}

const ReplyItem = ({ reply, discussionId, answerId, viewerId }: ReplyItemProps) => {
  const format = useFormatter();
  const queryClient = useQueryClient();
  
  const [isUpvoted, setIsUpvoted] = useState(reply.hasUpvote);
  const [upvoteCount, setUpvoteCount] = useState(reply.upvoteCount);
  const [isUpvoteAnimating, setIsUpvoteAnimating] = useState(false);
  
  // États pour l'édition et la suppression
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Synchroniser l'état local avec les props après un refresh
  useEffect(() => {
    setIsUpvoted(reply.hasUpvote);
    setUpvoteCount(reply.upvoteCount);
  }, [reply.hasUpvote, reply.upvoteCount]);
  
  // Focus sur le textarea lors de l'édition
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing]);
  
  const [emojiAnimation, setEmojiAnimation] = useState<{ isAnimating: boolean; emoji: string; reactionType?: Reaction }>({
    isAnimating: false,
    emoji: '',
    reactionType: undefined
  });
  const [disappearingEmoji, setDisappearingEmoji] = useState<{ isAnimating: boolean; emoji: string; reactionType?: Reaction }>({
    isAnimating: false,
    emoji: '',
    reactionType: undefined
  });

  const particleColors = ['#5E6AD2', '#E91E63', '#FF9800', '#FFEB3B', '#4CAF50', '#03A9F4'];

  const relativeTime = format.relativeTime(new Date(reply.createdAt), { now: new Date() });

  // Mutation pour modifier la reply
  const { mutateAsync: updateReplyMutation, isPending: isUpdating } = useMutation({
    mutationFn: (content: string) => {
      return updateReply({
        discussionId,
        answerId,
        replyId: reply.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.map((rep) => {
                  if (rep.id !== reply.id) return rep;
                  return {
                    ...rep,
                    content: editContent,
                  };
                }),
              };
            }),
          };
        },
      );
      setIsEditing(false);
      toast.success('Réponse modifiée !');
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    },
  });

  // Mutation pour supprimer la reply
  const { mutateAsync: deleteReplyMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => {
      return deleteReply({
        discussionId,
        answerId,
        replyId: reply.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.filter((rep) => rep.id !== reply.id),
              };
            }),
          };
        },
      );
      setShowDeleteDialog(false);
      toast.success('Réponse supprimée !');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleEdit = () => {
    setEditContent(reply.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }
    if (editContent.trim() === reply.content.trim()) {
      setIsEditing(false);
      return;
    }
    await updateReplyMutation(editContent.trim());
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await deleteReplyMutation();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSaveEdit();
    }
  };

  const { mutateAsync: createReactionReplyMutation } = useMutation({
    mutationFn: (reaction: Reaction) => {
      return createReactionReply({
        discussionId,
        answerId,
        replyId: reply.id,
        type: reaction,
      });
    },
    onSuccess: (_data, reaction) => {
      const selfProfile = queryClient.getQueryData(['selfProfile']) as selfProfileType;
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.map((rep) => {
                  if (rep.id !== reply.id) return rep;
                  
                  const hasReactedAddItem = [...rep.hasReacted];
                  const reactionsAddItem = [...rep.reactions];
                  const findReaction = reactionsAddItem.find((r) => r.type === reaction);
                  
                  if (!findReaction) {
                    reactionsAddItem.push({
                      type: reaction,
                      count: 1,
                      profileIds: [selfProfile.id],
                    });
                  } else {
                    findReaction.count += 1;
                    findReaction.profileIds.push(selfProfile.id);
                  }
                  hasReactedAddItem.push(reaction);
                  
                  return {
                    ...rep,
                    hasReacted: hasReactedAddItem,
                    reactions: reactionsAddItem,
                  };
                }),
              };
            }),
          };
        },
      );
    },
  });

  const { mutateAsync: deleteReactionReplyMutation } = useMutation({
    mutationFn: (reaction: Reaction) => {
      return deleteReactionReply({
        discussionId,
        answerId,
        replyId: reply.id,
        type: reaction,
      });
    },
    onSuccess: (_data, newReaction) => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.map((rep) => {
                  if (rep.id !== reply.id) return rep;
                  
                  const find = rep.reactions.find((reaction) => reaction.type === newReaction);
                  
                  if (find && find.count === 1) {
                    return {
                      ...rep,
                      hasReacted: rep.hasReacted.filter((hasReacted) => newReaction !== hasReacted),
                      reactions: rep.reactions.filter((reaction) => reaction.type !== newReaction),
                    };
                  }
                  
                  return {
                    ...rep,
                    hasReacted: rep.hasReacted.filter((hasReacted) => newReaction !== hasReacted),
                    reactions: rep.reactions.map((reaction) => {
                      if (reaction.type === newReaction) {
                        return {
                          ...reaction,
                          count: reaction.count - 1,
                        };
                      }
                      return reaction;
                    }),
                  };
                }),
              };
            }),
          };
        },
      );
    },
  });

  const { mutateAsync: createUpvoteReplyMutation } = useMutation({
    mutationFn: () => {
      return createUpvoteReply({
        discussionId,
        answerId,
        replyId: reply.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.map((rep) => {
                  if (rep.id !== reply.id) return rep;
                  
                  return {
                    ...rep,
                    hasUpvote: true,
                    upvoteCount: rep.upvoteCount + 1,
                  };
                }),
              };
            }),
          };
        },
      );
    },
  });

  const { mutateAsync: deleteUpvoteReplyMutation } = useMutation({
    mutationFn: () => {
      return deleteUpvoteReply({
        discussionId,
        answerId,
        replyId: reply.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (!cache) return cache;
          
          return {
            ...cache,
            answers: cache.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              
              return {
                ...ans,
                replies: ans.replies.map((rep) => {
                  if (rep.id !== reply.id) return rep;
                  
                  return {
                    ...rep,
                    hasUpvote: false,
                    upvoteCount: Math.max(0, rep.upvoteCount - 1),
                  };
                }),
              };
            }),
          };
        },
      );
    },
  });

  const handleUpvoteClick = () => {
    if (isUpvoted) {
      setIsUpvoted(false);
      setUpvoteCount((prev) => Math.max(0, prev - 1));
      deleteUpvoteReplyMutation();
    } else {
      setIsUpvoted(true);
      setUpvoteCount((prev) => prev + 1);
      setIsUpvoteAnimating(true);
      setTimeout(() => setIsUpvoteAnimating(false), 300);
      createUpvoteReplyMutation();
    }
  };

  const handleEmojiClick = (reaction: Reaction) => {
    const findReaction = reactions.find(r => r.enum === reaction);
    const existingReaction = reply.reactions.find(r => r.type === reaction);
    
    if (reply.hasReacted.includes(reaction)) {
      // Animation de disparition si c'est le dernier
      if (existingReaction && existingReaction.count === 1 && findReaction) {
        setDisappearingEmoji({ isAnimating: true, emoji: findReaction.icon, reactionType: reaction });
        setTimeout(() => {
          setDisappearingEmoji({ isAnimating: false, emoji: '', reactionType: undefined });
          deleteReactionReplyMutation(reaction);
        }, 400);
      } else {
        deleteReactionReplyMutation(reaction);
      }
    } else {
      // Animation d'apparition
      if (findReaction) {
        setEmojiAnimation({ isAnimating: true, emoji: findReaction.icon, reactionType: reaction });
        setTimeout(() => {
          setEmojiAnimation({ isAnimating: false, emoji: '', reactionType: undefined });
        }, 400);
      }
      createReactionReplyMutation(reaction);
    }
  };

  return (
    <div className="flex gap-2">
      <DiscussionMiniProfile
        profileId={reply.profile?.id}
        firstName={reply.profile?.firstName}
        lastName={reply.profile?.lastName}
        avatar={reply.profile?.avatar || ''}
        highlight={reply.profile?.highlight}
        bio={reply.profile?.bio}
        isFollowing={reply.profile?.isFollowing}
        countryCode={reply.profile?.countryCode ?? undefined}
        ecosystemRoles={reply.profile?.ecosystemRoles}
        streak={reply.profile?.streak}
        stats={{ followers: reply.profile?.followedBy ?? 0, following: reply.profile?.following ?? 0, posts: reply.profile?.postsCount ?? 0 }}
        size="sm"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/profile/${reply.profile?.id}`} 
              className="font-medium text-sm hover:underline text-gray-900"
            >
              {reply.profile ? `${reply.profile.firstName} ${reply.profile.lastName}` : 'Utilisateur'}
            </Link>
            <p className="text-xs text-muted-foreground">{reply.profile?.highlight}</p>
            <span className="text-xs text-gray-500">{relativeTime}</span>
          </div>
          

        </div>
        
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <TextArea
              ref={textareaRef}
              value={editContent}
              onChange={setEditContent}
              onKeyDown={handleEditKeyDown}
              placeholder="Modifier votre réponse..."
              className="min-h-16 resize-none border-gray-300 focus:border-[#5E6AD2] focus:ring-[#5E6AD2] text-sm"
              isDisabled={isUpdating}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Échap pour annuler, ⌘+Entrée pour sauvegarder
              </p>
              <div className="flex gap-2">
                <Button
                  color="tertiary"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editContent.trim()}
                >
                  {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mt-2">{reply.content}</p>
        )}
        
        {/* Réactions interactives */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex gap-2 items-center flex-wrap">
            {reply.reactions?.map((reactionData) => {
              const findReaction = reactions.find((r) => r.enum === reactionData.type);
              const hasReacted = reply.hasReacted?.includes(reactionData.type);
              
              return (
                <motion.div
                  key={reactionData.type}
                  onClick={() => handleEmojiClick(reactionData.type)}
                  className={`${hasReacted
                    ? 'hover:bg-primary-50 border-primary-700 text-primary-700'
                    : 'hover:bg-gray-100'
                  } flex items-center gap-1 border py-px px-1.5 rounded-md cursor-pointer relative text-xs`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reactionData.type ? {
                    y: [0, -2, 2, -1, 1, 0],
                    backgroundColor: ['rgb(243, 244, 246)', 'rgb(254, 226, 226)', 'rgb(254, 226, 226)', 'rgb(243, 244, 246)'],
                    scale: [1, 1, 1, 0.9, 0.7, 0],
                    opacity: [1, 1, 1, 0.8, 0.6, 0]
                  } : {}}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <motion.span 
                    className="text-sm"
                    animate={hasReacted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {findReaction?.icon}
                  </motion.span>
                  <motion.span 
                    className="text-xs w-2"
                    animate={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reactionData.type ? {
                      scale: [1, 1.2, 0.8, 0],
                      opacity: [1, 0.8, 0.6, 0]
                    } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <NumberFlow 
                      value={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reactionData.type && reactionData.count === 1 
                        ? 0 
                        : reactionData.count}
                      format={{ useGrouping: false }}
                    />
                  </motion.span>
                </motion.div>
              );
            })}
            
            {/* Bouton pour ajouter une réaction */}
            <Dropdown.Root>
              <Button
                color="tertiary" 
                size="sm" 
                className="w-6 h-6 p-0 rounded-full bg-gray-50 hover:bg-gray-100"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 7H6.01M10 7H10.01M6 10C6.5 10.5 7.5 11 8 11C8.5 11 9.5 10.5 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Button>
              
              <Dropdown.Popover className="flex gap-2 items-center rounded-md shadow-md px-3 py-1">
                {reactions.map((reaction) => (
                  <button
                    key={reaction.enum}
                    className="text-base hover:scale-125 transition-transform p-0.5"
                    onClick={() => handleEmojiClick(reaction.enum)}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
          
          {/* Actions de la reply */}
          <div className="flex gap-4 items-center font-medium text-gray-700 text-xs mt-1">
            {/* Vote animé pour les replies */}
            <motion.div
              className={`cursor-pointer hover:text-primary-700 transition-colors flex items-center gap-2 ${
                isUpvoted ? 'text-[#5E6AD2]' : 'text-gray-700'
              }`}
              onClick={handleUpvoteClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isUpvoteAnimating ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ 
                  type: "tween",
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <Triangle 
                  className={`w-3 h-3 transition-all duration-200 ${
                    isUpvoted 
                      ? 'stroke-[#5E6AD2] fill-[#5E6AD2]' 
                      : 'stroke-gray-400 fill-transparent'
                  }`} 
                />
                {/* Mini particles pour les replies */}
                <AnimatePresence>
                  {isUpvoteAnimating && (
                    <>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-0.5 h-0.5 rounded-full"
                          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                          animate={{ 
                            x: Math.cos((i * 90) * Math.PI / 180) * 8,
                            y: Math.sin((i * 90) * Math.PI / 180) * 8,
                            scale: [0, 1, 0], 
                            opacity: [1, 1, 0] 
                          }}
                          transition={{ 
                            type: "tween",
                            duration: 0.3,
                            delay: 0,
                            ease: "easeOut"
                          }}
                          style={{
                            backgroundColor: particleColors[i % particleColors.length],
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.span
                animate={isUpvoteAnimating ? { scale: [1, 1.1, 1] } : {}}
                transition={{ 
                  type: "tween",
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                Upvote ({upvoteCount})
              </motion.span>
            </motion.div>
            
            {/* Dropdown pour les autres actions */}
            <Dropdown.Root>
              <Button color="tertiary" size="sm" iconLeading={<MoreHorizontal data-icon />} className="h-5 w-5 p-0" />
              <Dropdown.Popover>
                <Dropdown.Menu>
                  {reply.isAuthor && (
                    <>
                      <Dropdown.Section>
                        <Dropdown.Item onAction={handleEdit} icon={Pencil}>
                          Modifier
                        </Dropdown.Item>
                      </Dropdown.Section>
                      <Dropdown.Separator />
                    </>
                  )}
                  <Dropdown.Section>
                    <Dropdown.Item icon={Flag} onAction={() => setIsReportOpen(true)}>
                      Signaler
                    </Dropdown.Item>
                  </Dropdown.Section>
                  {reply.isAuthor && (
                    <>
                      <Dropdown.Separator />
                      <Dropdown.Section>
                        <Dropdown.Item onAction={handleDelete} className="text-red-600 hover:text-red-700" icon={Trash2}>
                          Supprimer
                        </Dropdown.Item>
                      </Dropdown.Section>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
        </div>

        {/* Animation emoji */}
        <AnimatePresence>
          {emojiAnimation.isAnimating && (
            <motion.div
              className="absolute pointer-events-none z-10 text-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.6 }}
            >
              {emojiAnimation.emoji}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette réponse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Votre réponse sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        resourceType="DISCUSSION_ANSWER_REPLY"
        resourceId={reply.id}
      />
    </div>
  );
};

export default ReplyItem;
