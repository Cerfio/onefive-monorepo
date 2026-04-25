'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/base/buttons/button';
import { ArrowLeft, Eye, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/base/badges/badges';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchDiscussion, createPollVote, updateDiscussion } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import { tags } from '@/constant';
import { useFormatter } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import RichCommentInput from '@/components/discussions/RichCommentInput';
import Answer from '@/components/discussions/Answer';
import LoadingPage from '@/components/discussions/LoadingPage';
import VoteSection from '@/components/discussions/VoteSection';
import DiscussionSidebar from '@/components/discussions/DiscussionSidebar';
import { containerVariants, cardVariants } from '@/components/discussions/animations';
import { useDiscussionComment } from '@/hooks/useDiscussionComment';
import { EditDiscussionModal } from '@/app/(protected)/discussions/modals/EditDiscussionModal';
import {
  Tooltip,
  TooltipTrigger,
} from '@/components/base/tooltip/tooltip';
import { Tags, DiscussionType } from '@/enums';
import { BadgeColors } from '@/components/base/badges/badge-types';

export function DiscussionFullView({ discussionId }: { discussionId: string }) {
  const id = discussionId;
  const queryClient = useQueryClient();
  const selfProfile = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
  
  const { data, isSuccess, isLoading, error } = useQuery({
    queryKey: ['discussion', { id, viewerId: selfProfile?.id ?? null }],
    queryFn: () =>
      fetchDiscussion({
        id,
        currentProfileId: selfProfile?.id || '',
      }),
    enabled: Boolean(id),
  });

  const { comment, setComment, handleSubmitComment } = useDiscussionComment({
    discussionId: id,
  });

  const format = useFormatter();
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [selectedPollOptions, setSelectedPollOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const tagColorMap: Record<Tags, BadgeColors> = {
    [Tags.FUNDAMENTALS]: 'brand',
    [Tags.MARKET]: 'blue',
    [Tags.MARKETING]: 'indigo',
    [Tags.SALES]: 'purple',
    [Tags.SCALING_AND_GROWTH]: 'pink',
    [Tags.FUNDING_AND_INVESTMENT]: 'gray-blue',
    [Tags.LEGAL]: 'orange',
    [Tags.HUMAN_RESOURCES_AND_TEAM]: 'success',
    [Tags.PRODUCT]: 'error',
    [Tags.TECHNOLOGY]: 'warning',
    [Tags.CUSTOMER]: 'gray',
    [Tags.BUILD_IN_PUBLIC]: 'blue',
  };

  const isPoll = data?.type === DiscussionType.POLL || data?.type === DiscussionType.POLL_MULTIPLE;
  const isMultiPoll = data?.type === DiscussionType.POLL_MULTIPLE;
  const pollOptions = data?.options || [];
  const pollResults = data?.pollResults || {};
  const hasVoted = data?.hasVoted || false;

  const canEditDiscussion = (() => {
    if (!data?.isAuthor) return false;
    if (!data?.createdAt) return false;
    const createdAtMs = new Date(data.createdAt).getTime();
    if (Number.isNaN(createdAtMs)) return false;
    const tenMinutesMs = 10 * 60 * 1000;
    return Date.now() - createdAtMs <= tenMinutesMs;
  })();

  const totalVotes = Object.values(pollResults).reduce((a, b) => a + b, 0);
  const getPercent = (option: string) => totalVotes === 0 ? 0 : Math.round((pollResults[option] || 0) / totalVotes * 100);

  const { mutateAsync: votePoll, isPending: isVoting } = useMutation({
    mutationFn: async (options: string[]) => {
      return createPollVote({ discussionId: id, options });
    },
    onSuccess: () => {
      toast.success('Merci pour votre vote !');
      queryClient.invalidateQueries({ queryKey: ['discussion', { id }] });
    },
    onError: () => {
      toast.error('Erreur lors du vote. Veuillez réessayer.');
    },
  });

  const { mutateAsync: mutateUpdateDiscussion, isPending: isUpdatingDiscussion } = useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      options: string[];
      chosenTags: string[];
      discussionType: DiscussionType;
      saas: { domain: string } | null;
    }) => {
      return updateDiscussion({
        id,
        question: payload.title,
        content: payload.content,
        tags: payload.chosenTags,
        context: payload.saas?.domain ?? null,
        options:
          payload.discussionType === DiscussionType.POLL || payload.discussionType === DiscussionType.POLL_MULTIPLE
            ? payload.options
            : [],
      });
    },
    onSuccess: () => {
      toast.success('Discussion mise à jour');
      queryClient.invalidateQueries({ queryKey: ['discussion', { id }] });
      queryClient.invalidateQueries({ queryKey: ['discussion', { id, viewerId: selfProfile?.id ?? null }] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour. Veuillez réessayer.');
    },
  });

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  if (error) {
    if (
      (error as any).name === 'HTTPError' &&
      (error as any).response.status === 404
    ) {
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col gap-2 items-center">
            <div>Discussion not found</div>
            <Link href="/discussions">
              <Button color="secondary" iconLeading={<ArrowLeft width={16} height={16} data-icon />}>
                Back to discussions
              </Button>
            </Link>
          </div>
        </div>
      );
    } else {
      return <div>An error occurred</div>;
    }
  }

  const relativeTime = data
    ? format.relativeTime(new Date(data.createdAt), { now: new Date() })
    : '';

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5E6AD2] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour aux discussions
          </button>
        </div>

        {isLoading && <LoadingPage />}

        {isSuccess && data && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="flex gap-8">
              <div className="flex-1">
                <motion.div variants={cardVariants}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex gap-12">
                      <VoteSection
                        discussionId={id}
                        initialUpvoted={data.hasUpvote}
                        initialUpvoteCount={data.upvoteCount}
                      />
                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center w-full">
                          <h1 className="text-[#101828] font-semibold text-lg leading-tight">
                            {data.question}
                          </h1>
                          {data.isAuthor && canEditDiscussion && (
                            <Button
                              color="secondary"
                              onClick={() => setIsEditOpen(true)}
                              disabled={isUpdatingDiscussion}
                            >
                              Modifier
                            </Button>
                          )}
                          {data.context && (
                            <Tooltip title={`Question à propos de ${data.context}`}>
                              <TooltipTrigger>
                                <Image
                                  src={`https://icons.duckduckgo.com/ip3/${data.context}.ico`}
                                  alt={data.context}
                                  width={24}
                                  height={24}
                                  className="rounded-md cursor-help"
                                />
                              </TooltipTrigger>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2">
                          {data.tags.map((tag) => {
                            const findTag = tags.find((t) => t.enum === tag);
                            const color = findTag ? tagColorMap[findTag.enum as Tags] || 'gray' : 'gray';
                            if (findTag)
                              return (
                                <Badge key={tag} type="pill-color" color={color}>
                                  {findTag.title}
                                </Badge>
                              );
                          })}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                          <span>{relativeTime}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{data.viewCount} vues</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{data.answerCount} réponses</span>
                          </div>
                        </div>

                        {data.content && (
                          <div className="text-gray-700 mt-4 whitespace-pre-wrap">
                            {data.content}
                          </div>
                        )}

                        {isPoll && pollOptions.length > 0 && (
                          <div className="mt-6 mb-8 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {isMultiPoll ? 'Sondage (choix multiples)' : 'Sondage (choix unique)'}
                              </h3>
                              {!hasVoted && !showResults && totalVotes > 0 && (
                                <button
                                  onClick={() => setShowResults(true)}
                                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  Voir les résultats
                                </button>
                              )}
                            </div>
                            <AnimatePresence mode="wait">
                              {(!hasVoted && !showResults) ? (
                                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                  <form
                                    onSubmit={async (e: React.FormEvent) => {
                                      e.preventDefault();
                                      if (isMultiPoll) {
                                        if (selectedPollOptions.length === 0) return toast.error('Veuillez sélectionner au moins une option.');
                                        await votePoll(selectedPollOptions);
                                      } else {
                                        if (!selectedPollOption) return toast.error('Veuillez sélectionner une option.');
                                        await votePoll([selectedPollOption]);
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col gap-2 mb-4">
                                      {pollOptions.map((option, index) => {
                                        const isSelected = isMultiPoll ? selectedPollOptions.includes(option) : selectedPollOption === option;
                                        return (
                                          <motion.button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                              if (isMultiPoll) {
                                                setSelectedPollOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
                                              } else {
                                                setSelectedPollOption(option);
                                              }
                                            }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${isSelected ? 'border-[#5E6AD2] bg-[#5E6AD2]/5' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                                          >
                                            <div className={`shrink-0 w-5 h-5 ${isMultiPoll ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center ${isSelected ? 'border-[#5E6AD2] bg-[#5E6AD2]' : 'border-gray-300 bg-white'}`}>
                                              {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`${isMultiPoll ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5 rounded-full'} bg-white`} />}
                                            </div>
                                            <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-[#5E6AD2]' : 'text-gray-900'}`}>{option}</span>
                                          </motion.button>
                                        );
                                      })}
                                    </div>
                                    <Button type="submit" isDisabled={(isMultiPoll ? selectedPollOptions.length === 0 : !selectedPollOption) || isVoting} className="w-full sm:w-auto">
                                      {isVoting ? 'Envoi...' : 'Voter'}
                                    </Button>
                                  </form>
                                </motion.div>
                              ) : totalVotes > 0 ? (
                                <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                  <div className="flex flex-col gap-3">
                                    {pollOptions.map((option, index) => {
                                      const percent = getPercent(option);
                                      const maxPercent = Math.max(...pollOptions.map(o => getPercent(o)));
                                      const isWinning = percent === maxPercent && percent > 0;
                                      const voteCount = pollResults[option] || 0;
                                      return (
                                        <motion.div key={option} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="relative">
                                          <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-900">{option}</span>
                                              {isWinning && <span className="text-xs px-2 py-0.5 bg-[#5E6AD2]/10 text-[#5E6AD2] rounded-full font-medium">Gagnant</span>}
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium">{percent}% · {voteCount} vote{voteCount > 1 ? 's' : ''}</span>
                                          </div>
                                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`absolute top-0 left-0 h-full rounded-full ${isWinning ? 'bg-[#5E6AD2]' : 'bg-gray-300'}`} />
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <span className="text-xs text-gray-500">Total : {totalVotes} vote{totalVotes > 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div key="no-votes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                  <div className="text-center py-4 text-gray-500 text-sm">Pas encore de votes. Soyez le premier à voter !</div>
                                  <Button onClick={() => setShowResults(false)} color="secondary" className="w-full">Voter</Button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {data.isAuthor && (
                  <EditDiscussionModal
                    isOpen={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    isLoading={isUpdatingDiscussion}
                    initialValues={{
                      title: data.question,
                      content: data.content ?? '',
                      options: data.options ?? [],
                      chosenTags: data.tags ?? [],
                      discussionType: data.type,
                      saas: data.context ? { domain: data.context, id: '', name: '', logoUrl: '' } : null,
                    }}
                    onSubmit={async (payload) => { await mutateUpdateDiscussion(payload); }}
                  />
                )}

                <motion.div variants={cardVariants} className="mb-8">
                  <RichCommentInput comment={comment} setComment={setComment} callback={handleSubmitComment} />
                </motion.div>

                <motion.div variants={cardVariants}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="font-semibold text-gray-700 text-lg mb-6">Réponses ({data.answerCount})</div>
                    <div className="flex flex-col gap-6">
                      {data.answers.length > 0 ? (
                        data.answers.map((answer) => (
                          <Answer key={answer.id} answer={answer} discussionId={id} viewerId={selfProfile?.id ?? null} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">Aucune réponse</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
              <DiscussionSidebar data={data} />
            </div>
          </motion.div>
        )}

        {!isLoading && !isSuccess && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
            Impossible de charger cette discussion pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
