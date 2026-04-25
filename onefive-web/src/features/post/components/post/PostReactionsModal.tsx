"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Loader2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/base/dialog/dialog';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Skeleton } from '@/components/base/skeleton/skeleton';
import { cn } from '@/lib/utils';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import type { tempReactionType } from '../../post.api';
import { Reaction } from '@/enums';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

type ReactionFilterKey = keyof NonNullable<tempReactionType>;
type ReactionFilter = 'all' | ReactionFilterKey;

interface PostReactionRow {
  id: string;
  reaction: Reaction;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    highlight?: string;
    bio?: string;
    isFollowing?: boolean;
    followers?: number;
    following?: number;
    posts?: number;
    countryCode?: string;
    countryName?: string;
    ecosystemRoles?: string[];
    streak?: number;
  };
}

const PAGE_SIZE = 20;
const reactionFilterOrder: ReactionFilterKey[] = ['like', 'love', 'support', 'insightful', 'funny', 'celebrate'];

const reactionMeta: Record<ReactionFilterKey, { label: string; accent: string; icon: any }> = {
  like: { label: 'Bravo', accent: 'text-sky-600', icon: likeTrueEmoji },
  love: { label: 'Love', accent: 'text-rose-500', icon: loveEmoji },
  support: { label: 'Support', accent: 'text-violet-500', icon: supportEmoji },
  insightful: { label: 'Insightful', accent: 'text-amber-600', icon: insightfulEmoji },
  funny: { label: 'Funny', accent: 'text-yellow-600', icon: funnyEmoji },
  celebrate: { label: 'Celebrate', accent: 'text-emerald-600', icon: celebrateEmoji },
};

const reactionKeyByEnum: Partial<Record<Reaction, ReactionFilterKey>> = {
  [Reaction.THUMBS_UP]: 'like',
  [Reaction.HEART]: 'love',
  [Reaction.COTILLON]: 'support',
  [Reaction.THINKING]: 'insightful',
  [Reaction.LAUGH]: 'funny',
  [Reaction.ROCKET]: 'celebrate',
  [Reaction.CRY]: 'like',
  [Reaction.EYES]: 'like',
  [Reaction.SMILE]: 'like',
  [Reaction.THUMBS_DOWN]: 'like',
};

const getFilterKeyFromReaction = (reaction?: Reaction | string): ReactionFilterKey => {
  if (!reaction) return 'like';
  return reactionKeyByEnum[reaction as Reaction] ?? 'like';
};

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface PostReactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  reactions?: tempReactionType;
  reactionCount?: number;
}

export default function PostReactionsModal({
  open,
  onOpenChange,
  postId,
  reactions,
  reactionCount,
}: PostReactionsModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<ReactionFilter>('all');
  const { navigateToConversation } = useNavigateToConversation();

  useEffect(() => {
    if (!open) {
      setSelectedFilter('all');
    }
  }, [open]);

  const queryEnabled = open && Boolean(postId);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        skip: pageParam.toString(),
        take: PAGE_SIZE.toString(),
        orderBy: 'createdAt',
        order: 'desc',
      });
      const response = await api.get(`post-reactions/posts/${postId}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Unable to load reactions');
      }
      const payload: any = await response.json();
      const items = (payload?.data || []) as PostReactionRow[];
      return {
        items,
        nextSkip: items.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextSkip,
    enabled: queryEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  if (!postId) {
    return null;
  }

  const reactionItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const availableFilterKeys = useMemo(() => {
    const entries = new Set<ReactionFilterKey>();
    reactionItems.forEach((item) => entries.add(getFilterKeyFromReaction(item.reaction)));
    return entries;
  }, [reactionItems]);

  const reactionCounts = useMemo(() => ({
    like: reactions?.like ?? 0,
    love: reactions?.love ?? 0,
    support: reactions?.support ?? 0,
    insightful: reactions?.insightful ?? 0,
    funny: reactions?.funny ?? 0,
    celebrate: reactions?.celebrate ?? 0,
  }), [reactions]);

  const totalFromSummary = useMemo(
    () => Object.values(reactionCounts).reduce((sum, value) => sum + (value || 0), 0),
    [reactionCounts]
  );

  const totalDisplay = reactionCount ?? (totalFromSummary || reactionItems.length);

  const filterOptions = useMemo(() => {
    const ordered = reactionFilterOrder
      .map((key) => ({
        key,
        label: reactionMeta[key].label,
        icon: reactionMeta[key].icon,
        accent: reactionMeta[key].accent,
        count: reactionCounts[key] ?? 0,
      }))
      .filter((option) => option.count > 0 || availableFilterKeys.has(option.key));

    return [
      {
        key: 'all' as const,
        label: 'All',
        icon: null,
        accent: 'text-primary',
        count: totalDisplay,
      },
      ...ordered,
    ];
  }, [reactionCounts, availableFilterKeys, totalDisplay]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') {
      return reactionItems;
    }
    return reactionItems.filter(
      (item) => getFilterKeyFromReaction(item.reaction) === selectedFilter
    );
  }, [reactionItems, selectedFilter]);

  const showEmptyState = !isLoading && !isError && filteredItems.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Réactions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={selectedFilter === option.key}
                onClick={() => setSelectedFilter(option.key as ReactionFilter)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  selectedFilter === option.key
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                {option.icon ? (
                  <Image src={option.icon} alt={`${option.label} icon`} width={16} height={16} />
                ) : (
                  <Users className="size-3.5" />
                )}
                <span>{option.label}</span>
                <span className="text-[11px] font-semibold">{option.count}</span>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-2 rounded-lg border border-dashed p-4">
              {[...Array(4)].map((_, index) => (
                <div key={`reaction-skeleton-${index}`} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="mb-3">{error instanceof Error ? error.message : 'Unable to load reactions.'}</p>
              <Button color="secondary" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {showEmptyState ? (
                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  {selectedFilter === 'all' ? 'No reactions yet.' : 'No reactions of this type yet.'}
                </div>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {filteredItems.map((reaction) => {
                    const filterKey = getFilterKeyFromReaction(reaction.reaction);
                    const meta = reactionMeta[filterKey];
                    const profileId = reaction.profile?.id || reaction.profileId;
                    const highlight = reaction.profile?.highlight;
                    
                    // Gérer les différents formats de nom (name ou firstName/lastName)
                    let firstName = reaction.profile?.firstName || '';
                    let lastName = reaction.profile?.lastName || '';
                    if (!firstName && !lastName && reaction.profile?.name) {
                      const [first, ...lastParts] = reaction.profile.name.split(' ');
                      firstName = first || '';
                      lastName = lastParts.join(' ');
                    }
                    const profileName = `${firstName} ${lastName}`.trim() || 'Membre OneFive';
                    
                    return (
                      <li key={reaction.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserMiniProfile
                            profileId={profileId}
                            firstName={firstName || profileName}
                            lastName={lastName}
                            avatar={reaction.profile?.avatar || ''}
                            highlight={highlight || 'Membre OneFive'}
                            bio={reaction.profile?.bio}
                            countryCode={reaction.profile?.countryCode}
                            countryName={reaction.profile?.countryName}
                            isFollowing={reaction.profile?.isFollowing}
                            ecosystemRoles={reaction.profile?.ecosystemRoles}
                            streak={reaction.profile?.streak}
                            stats={{
                              followers: reaction.profile?.followers ?? 0,
                              following: reaction.profile?.following ?? 0,
                              posts: reaction.profile?.posts ?? 0,
                            }}
                            size="sm"
                            className="shrink-0"
                            onMessage={profileId ? () => navigateToConversation(profileId) : undefined}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(reaction.createdAt)}
                          </p>
                        </div>
                        <Badge type="pill-color" color="gray" size="sm" className={cn('gap-1 capitalize', meta.accent)}>
                          <Image src={meta.icon} alt={`${meta.label} icon`} width={16} height={16} />
                          {meta.label}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {hasNextPage && !isError && (
            <Button
              color="secondary"
              size="sm"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
              Load more
            </Button>
          )}
        </div>

        <DialogFooter className="flex justify-end">
          <Button color="tertiary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
