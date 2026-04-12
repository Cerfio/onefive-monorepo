import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, MoreHorizontal, Pencil, Trash2, Share2, Flag } from 'lucide-react';
import { ReportModal } from '@/components/modals/ReportModal';
import { useFormatter } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultProfile, reactions } from '@/constant';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Button } from '@/components/base/buttons/button';
import RichCommentInput from '@/components/discussions/RichCommentInput';
import DiscussionMiniProfile from '@/components/discussions/DiscussionMiniProfile';
import ReplyItem from '@/components/discussions/ReplyItem';
import { DiscussionAnswerInfer, SpecificDiscussionInfer, createReactionAnswer, deleteReactionAnswer, createUpvoteAnswer, deleteUpvoteAnswer, createReply, updateAnswer, deleteAnswer } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import { Reaction } from '@/enums';
import NumberFlow from '@number-flow/react';
import { toast } from 'sonner';
import Link from 'next/link';
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
import { Textarea } from '@/components/ui/textarea';

const Answer = ({
  answer,
  discussionId,
  viewerId,
}: {
  answer: DiscussionAnswerInfer;
  discussionId: string;
  viewerId: string | null;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(answer.hasUpvote);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [_countTrend, setCountTrend] = useState(0);
  
  // États pour l'édition et la suppression
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchroniser l'état local avec les props après un refresh
  useEffect(() => {
    setIsUpvoted(answer.hasUpvote);
    setUpvoteCount(answer.upvoteCount);
  }, [answer.hasUpvote, answer.upvoteCount]);
  
  // Focus sur le textarea lors de l'édition
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing]);

  const [replyComment, setReplyComment] = useState('');
  const [_isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);
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
  
  // Variables pour ajuster la position de l'animation emoji (en pixels)
  const emojiAnimationOffset = {
    x: -7,    // Décalage horizontal (+ vers la droite, - vers la gauche)
    y: -8     // Décalage vertical (+ vers le bas, - vers le haut)
  };

  const { mutateAsync: createUpvoteAnswerMutation } = useMutation({
    mutationFn: () => {
      return createUpvoteAnswer({
        discussionId,
        answerId: answer.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: cache.answers.map((ans) => {
                if (ans.id === answer.id) {
                  return {
                    ...ans,
                    hasUpvote: true,
                    upvoteCount: ans.upvoteCount + 1,
                  };
                }
                return ans;
              }),
            };
          }
          return cache;
        },
      );
    },
    onError: () => {
      setIsUpvoted(false);
      setUpvoteCount(prev => prev - 1);
      toast.error('Erreur lors du vote');
    }
  });

  const { mutateAsync: deleteUpvoteAnswerMutation } = useMutation({
    mutationFn: () => {
      return deleteUpvoteAnswer({
        discussionId,
        answerId: answer.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: cache.answers.map((ans) => {
                if (ans.id === answer.id) {
                  return {
                    ...ans,
                    hasUpvote: false,
                    upvoteCount: ans.upvoteCount - 1,
                  };
                }
                return ans;
              }),
            };
          }
          return cache;
        },
      );
    },
    onError: () => {
      setIsUpvoted(true);
      setUpvoteCount(prev => prev + 1);
      toast.error('Erreur lors de la suppression du vote');
    }
  });

  const handleUpvote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsUpvoted(!isUpvoted);
    setTimeout(() => {
      const newTrend = isUpvoted ? -1 : 1;
      setCountTrend(newTrend);
      setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
      
      // API calls
      if (isUpvoted) {
        deleteUpvoteAnswerMutation();
      } else {
        createUpvoteAnswerMutation();
      }
    }, 100);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleEmojiClick = (reaction: Reaction) => {
    const findReaction = reactions.find(r => r.enum === reaction);
    const existingReaction = answer.reactions.find(r => r.type === reaction);
    
    if (answer.hasReacted.includes(reaction)) {
      // Si c'est le dernier de cette réaction, déclencher l'animation de disparition
      if (existingReaction && existingReaction.count === 1 && findReaction) {
        setDisappearingEmoji({ isAnimating: true, emoji: findReaction.icon, reactionType: reaction });
        setTimeout(() => {
          setDisappearingEmoji({ isAnimating: false, emoji: '', reactionType: undefined });
          deleteReactionAnswerMutation(reaction);
        }, 400);
      } else {
        deleteReactionAnswerMutation(reaction);
      }
    } else {
      // Déclencher l'animation d'apparition avec l'emoji cliqué
      if (findReaction) {
        setEmojiAnimation({ isAnimating: true, emoji: findReaction.icon, reactionType: reaction });
        setTimeout(() => {
          setEmojiAnimation({ isAnimating: false, emoji: '', reactionType: undefined });
        }, 400);
      }
      createReactionAnswerMutation(reaction);
    }
    
    // Fermer la dropdown après avoir cliqué sur un emoji
    setIsEmojiDropdownOpen(false);
  };

  const format = useFormatter();
  const timestamp = new Date(answer.createdAt);
  const now = new Date();
  const relativeTime = format.relativeTime(timestamp, {
    now,
  });
  let profile = defaultProfile;
  if (answer.profile) {
    profile = {
      id: answer.profile.id,
      firstName: answer.profile.firstName,
      lastName: answer.profile.lastName,
      avatar: answer.profile.avatar || '',
      createdAt: answer.profile.createdAt,
      highlight: answer.profile.highlight || '',
      bio: answer.profile.bio || '',
      followedBy: answer.profile.followedBy,
      following: answer.profile.following ?? 0,
      postsCount: answer.profile.postsCount ?? 0,
      isFollowing: answer.profile.isFollowing ?? false,
      streak: answer.profile.streak ?? 0,
      countryCode: answer.profile.countryCode ?? undefined,
      countryName: (answer.profile as any).countryName ?? undefined,
      ecosystemRoles: answer.profile.ecosystemRoles ?? [],
    };
  }


  const queryClient = useQueryClient();

  // Mutation pour modifier la réponse
  const { mutateAsync: updateAnswerMutation, isPending: isUpdating } = useMutation({
    mutationFn: (content: string) => {
      return updateAnswer({
        discussionId,
        answerId: answer.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: cache.answers.map((ans) => {
                if (ans.id === answer.id) {
                  return {
                    ...ans,
                    content: editContent,
                  };
                }
                return ans;
              }),
            };
          }
          return cache;
        },
      );
      setIsEditing(false);
      toast.success('Réponse modifiée !');
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    },
  });

  // Mutation pour supprimer la réponse
  const { mutateAsync: deleteAnswerMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => {
      return deleteAnswer({
        discussionId,
        answerId: answer.id,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: cache.answers.filter((ans) => ans.id !== answer.id),
              answerCount: cache.answerCount - 1,
            };
          }
          return cache;
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
    setEditContent(answer.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(answer.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }
    if (editContent.trim() === answer.content.trim()) {
      setIsEditing(false);
      return;
    }
    await updateAnswerMutation(editContent.trim());
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await deleteAnswerMutation();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSaveEdit();
    }
  };

  const { mutateAsync: createReactionAnswerMutation } = useMutation({
    mutationFn: (reaction: Reaction) => {
      return createReactionAnswer({
        discussionId,
        answerId: answer.id,
        type: reaction,
      });
    },
    onSuccess: (_data, reaction) => {
      const selfProfile = queryClient.getQueryData([
        'selfProfile',
      ]) as selfProfileType;
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: [
                ...cache.answers.map((answer2) => {
                  if (answer2.id === answer.id) {
                    const hasReactedAddItem = answer2.hasReacted;
                    const reactionsAddItem = answer2.reactions;
                    const findReaction = reactionsAddItem.find(
                      (r) => r.type === reaction,
                    );
                    if (!findReaction) {
                      reactionsAddItem.push({
                        type: reaction,
                        count: 1,
                        profileIds: [selfProfile.id],
                      });
                    }
                    hasReactedAddItem.push(reaction);
                    return {
                      ...answer2,
                      hasReacted: hasReactedAddItem,
                      reactions: findReaction
                        ? reactionsAddItem.map((r) => {
                          const profiles = r.profileIds;
                          profiles.push(selfProfile.id);
                          if (r.type === reaction) {
                            return {
                              ...r,
                              count: r.count + 1,
                              profile: profiles,
                            };
                          }
                          return r;
                        })
                        : reactionsAddItem,
                    };
                  }
                  return answer2;
                }),
              ],
            };
          }
          return cache;
        },
      );
    },
  });

  const { mutateAsync: deleteReactionAnswerMutation } = useMutation({
    mutationFn: (reaction: Reaction) => {
      return deleteReactionAnswer({
        discussionId,
        answerId: answer.id,
        type: reaction,
      });
    },
    onSuccess: (_data, newReaction) => {
      queryClient.setQueryData(
        ['discussion', { id: discussionId, viewerId }],
        (cache: SpecificDiscussionInfer | undefined) => {
          if (cache) {
            return {
              ...cache,
              answers: [
                ...cache.answers.map((answer2) => {
                  if (answer2.id === answer.id) {
                    const find = answer2.reactions.find(
                      (reaction) => reaction.type === newReaction,
                    );
                    if (find && find.count === 1) {
                      return {
                        ...answer2,
                        hasReacted: answer2.hasReacted.filter(
                          (hasReacted) => newReaction !== hasReacted,
                        ),
                        reactions: answer2.reactions.filter(
                          (reaction) => reaction.type !== newReaction,
                        ),
                      };
                    }
                    return {
                      ...answer2,
                      hasReacted: answer2.hasReacted.filter(
                        (hasReacted) => newReaction !== hasReacted,
                      ),
                      reactions: answer2.reactions.map((reaction) => {
                        if (reaction.type === newReaction) {
                          return {
                            ...reaction,
                            count: reaction.count - 1,
                          };
                        }
                        return reaction;
                      }),
                    };
                  }
                  return answer2;
                }),
              ],
            };
          }
          return cache;
        },
      );
    },
  });

  const { mutateAsync: createReplyMutation } = useMutation({
    mutationFn: (content: string) => {
      return createReply({
        discussionId,
        answerId: answer.id,
        content,
      });
    },
    onSuccess: () => {
      // Rafraîchir la discussion pour récupérer la nouvelle reply
      queryClient.invalidateQueries({ queryKey: ['discussion', { id: discussionId, viewerId }] });
      toast.success('Réponse envoyée !');
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi de la réponse');
    },
  });

  const handleReplySubmit = async () => {
    if (!replyComment.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }
    await createReplyMutation(replyComment);
    setReplyComment('');
    setShowReply(false);
  };

  return (
    <div className="border-b border-gray-100 pb-6 last:border-b-0">
      <div className="flex gap-3">
        <DiscussionMiniProfile
          profileId={profile.id}
          firstName={profile.firstName}
          lastName={profile.lastName}
          avatar={profile.avatar}
          highlight={profile.highlight}
          bio={profile.bio}
          isFollowing={profile.isFollowing}
          countryCode={profile.countryCode}
          ecosystemRoles={profile.ecosystemRoles}
          streak={profile.streak}
          stats={{ followers: profile.followedBy, following: profile.following || 0, posts: profile.postsCount || 0 }}
          size="md"
        />
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/profile/${profile.id}`} className="font-medium text-sm hover:underline text-gray-900">
                {profile.firstName} {profile.lastName}
              </Link>
              <p className="text-xs text-muted-foreground">{profile.highlight}</p>
              <span className="text-xs text-gray-500">
                {relativeTime}
              </span>
            </div>
            

          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="Modifier votre réponse..."
                className="min-h-[80px] resize-none border-gray-300 focus:border-[#5E6AD2] focus:ring-[#5E6AD2]"
                disabled={isUpdating}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Appuyez sur Échap pour annuler, ⌘+Entrée pour sauvegarder
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
            <div className="text-gray-700">
              {answer.content}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex gap-4 items-center">
              {answer.reactions?.map((reaction) => {
                const findReaction = reactions.find(
                  (r) => r.enum === reaction.type,
                );
                const hasReacted = answer.hasReacted?.includes(reaction.type);
                return (
                  <motion.div
                    key={reaction.type}
                    onClick={() => handleEmojiClick(reaction.type)}
                    className={`${hasReacted
                      ? 'hover:bg-primary-50 border-primary-700 text-primary-700'
                      : 'hover:bg-gray-100'
                      } flex items-center gap-3 border py-[1px] px-2 rounded-lg cursor-pointer relative`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reaction.type ? {
                      y: [0, -3, 3, -2, 2, -1, 1, 0],
                      backgroundColor: ['rgb(243, 244, 246)', 'rgb(254, 226, 226)', 'rgb(254, 226, 226)', 'rgb(243, 244, 246)'],
                      scale: [1, 1, 1, 0.9, 0.7, 0.5, 0.3, 0],
                      opacity: [1, 1, 1, 0.8, 0.6, 0.4, 0.2, 0]
                    } : {}}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div 
                      className="text-lg relative inline-flex items-center justify-center"
                      animate={hasReacted ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {findReaction?.icon}
                    </motion.div>
                    <motion.div 
                      className="text-sm w-2"
                      animate={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reaction.type ? {
                        scale: [1, 1.2, 0.8, 0],
                        opacity: [1, 0.8, 0.6, 0]
                      } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <NumberFlow 
                        value={disappearingEmoji.isAnimating && disappearingEmoji.reactionType === reaction.type && reaction.count === 1 
                          ? 0 
                          : reaction.count}
                        format={{ useGrouping: false }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
              
              <Dropdown.Root>
                <Button
                  color="tertiary" 
                  size="sm" 
                  className="w-8 h-8 p-0 rounded-full bg-gray-50 hover:bg-gray-100"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 7H6.01M10 7H10.01M6 10C6.5 10.5 7.5 11 8 11C8.5 11 9.5 10.5 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Button>
                
                <Dropdown.Popover className="flex gap-3 items-center rounded-md shadow-md px-4 py-1">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.enum}
                      className="text-lg hover:scale-125 transition-transform p-1"
                      onClick={() => handleEmojiClick(reaction.enum)}
                    >
                      {reaction.icon}
                    </button>
                  ))}
                </Dropdown.Popover>
              </Dropdown.Root>
            </div>
            
            <div className="mt-2 flex gap-6 font-medium text-gray-700 text-xs items-center">
              {/* Vote animé pour les réponses principales */}
              <motion.div
                className={`cursor-pointer hover:text-primary-700 transition-colors flex items-center gap-2 ${
                  isUpvoted ? 'text-[#5E6AD2]' : 'text-gray-700'
                }`}
                onClick={handleUpvote}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={isAnimating ? {
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
                  {/* Mini particles pour les réponses */}
                  <AnimatePresence>
                    {isAnimating && (
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
                  animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ 
                    type: "tween",
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  Upvote ({upvoteCount})
                </motion.span>
              </motion.div>
              
              <div className="cursor-pointer hover:text-primary-700" onClick={() => setShowReply(true)}>
                Reply
              </div>
              
              {/* Dropdown pour les autres actions */}
              <Dropdown.Root>
                <Button color="tertiary" size="sm" iconLeading={<MoreHorizontal data-icon />} className="h-6 w-6 p-0" />
                <Dropdown.Popover>
                  <Dropdown.Menu>
                    {answer.isAuthor && (
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
                      <Dropdown.Item icon={Share2}>
                        Partager
                      </Dropdown.Item>
                      <Dropdown.Item icon={Flag} onAction={() => setIsReportOpen(true)}>
                        Signaler
                      </Dropdown.Item>
                    </Dropdown.Section>
                    {answer.isAuthor && (
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
              
              <span className="text-gray-400">{relativeTime}</span>
            </div>
          </div>

          {/* Reply input */}
          {showReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <RichCommentInput
                replyTo={`${profile.firstName} ${profile.lastName}`}
                comment={replyComment}
                setComment={setReplyComment}
                callback={handleReplySubmit}
                cancelCallback={() => setShowReply(false)}
                parentId={answer.id}
              />
            </motion.div>
          )}

          {/* Affichage des replies existantes */}
          {answer.replies && answer.replies.length > 0 && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-100 space-y-4">
              {answer.replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  discussionId={discussionId}
                  answerId={answer.id}
                  viewerId={viewerId}
                />
              ))}
            </div>
          )}

          {/* Emoji animation overlay */}
          <AnimatePresence>
            {emojiAnimation.isAnimating && (
              <motion.div
                className="absolute pointer-events-none z-10 text-2xl"
                initial={{ x: emojiAnimationOffset.x, y: emojiAnimationOffset.y, scale: 0.8, opacity: 0 }}
                animate={{ 
                  x: emojiAnimationOffset.x, 
                  y: emojiAnimationOffset.y - 40, 
                  scale: [0.8, 1.2, 1, 1, 1, 1, 1, 1], 
                  opacity: [0, 1, 1, 1, 1, 1, 1, 0] 
                }}
                transition={{ duration: 1.5 }}
                style={{ 
                  left: '20px', 
                  top: '20px' 
                }}
              >
                {emojiAnimation.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle effect overlay */}
          <AnimatePresence>
            {disappearingEmoji.isAnimating && (
              <div className="absolute pointer-events-none z-10" style={{ left: '15px', top: '15px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full"
                    initial={{ x: emojiAnimationOffset.x, y: emojiAnimationOffset.y, scale: 0, opacity: 1 }}
                    animate={{ 
                      x: emojiAnimationOffset.x + (Math.random() - 0.5) * 80, 
                      y: emojiAnimationOffset.y + (Math.random() - 0.5) * 80, 
                      scale: [0, 1, 0], 
                      opacity: [1, 1, 0] 
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ backgroundColor: particleColors[i] }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
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
        resourceType="DISCUSSION_ANSWER"
        resourceId={answer.id}
      />
    </div>
  );
};

export default Answer; 