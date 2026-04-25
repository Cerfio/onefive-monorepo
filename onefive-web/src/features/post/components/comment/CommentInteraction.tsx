import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import likeFalseEmoji from '@/icons/reactions/like-false.svg';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui';
import { Button } from '@/components/base/buttons/button';
import { Reaction } from '@/enums';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCommentReaction } from '../../hooks/mutations/useCommentReaction';
import type { CommentType } from '../../definitions/comment.definition';

interface Props {
  postId: string;
  commentId: string;
  currentCommentReaction: Reaction | null;
}

const CommentInteraction: React.FC<Props> = ({ postId, commentId, currentCommentReaction }) => {
  const queryClient = useQueryClient();
  const [isHoverCardOpen, setIsHoverCardOpen] = useState(false);
  const [reaction, setReaction] = useState<Reaction | null>(currentCommentReaction ?? null);
  const { mutate: sendReaction } = useCommentReaction();

  // Synchroniser l'état local avec la prop currentCommentReaction
  useEffect(() => {
    setReaction(currentCommentReaction);
  }, [currentCommentReaction]);

  const handleReaction = useCallback(
    (nextReaction: Reaction) => {
      const isSameReaction = reaction === nextReaction;
      const newReaction = isSameReaction ? null : nextReaction;

      // optimistic cache update for this comment within comments list
      const keyMap: Partial<Record<Reaction, keyof NonNullable<CommentType['reactions']> & string>> = {
        THUMBS_UP: 'like',
        HEART: 'love',
        COTILLON: 'support',
        THINKING: 'insightful',
        LAUGH: 'funny',
        ROCKET: 'celebrate',
      } as const;

      const commentsData = queryClient.getQueriesData({ queryKey: ['comments', postId] });
      commentsData.forEach(([key, data]) => {
        if (!data) return;
        const pagesWrap = data as any;
        if (pagesWrap.pages && Array.isArray(pagesWrap.pages)) {
          const newPages = pagesWrap.pages.map((page: any) => {
            if (!page?.comments) return page;
            return {
              ...page,
              comments: page.comments.map((c: CommentType) => {
                if (c.id !== commentId) return c;
                const reactions: any = { ...(c.reactions || {}) };
                const dec = (k?: string) => {
                  if (!k) return;
                  if (reactions[k] && reactions[k] > 0) {
                    reactions[k] = reactions[k] - 1;
                    if (reactions[k] === 0) delete reactions[k];
                  }
                };
                const inc = (k?: string) => {
                  if (!k) return;
                  reactions[k] = (reactions[k] || 0) + 1;
                };
                if (reaction == null && newReaction) {
                  inc(keyMap[newReaction]);
                  return { ...c, reactions: Object.keys(reactions).length ? reactions : undefined, reactionCount: (c.reactionCount ?? 0) + 1 };
                }
                if (reaction && newReaction == null) {
                  dec(keyMap[reaction]);
                  return { ...c, reactions: Object.keys(reactions).length ? reactions : undefined, reactionCount: Math.max(0, (c.reactionCount ?? 0) - 1) };
                }
                if (reaction && newReaction && reaction !== newReaction) {
                  dec(keyMap[reaction]);
                  inc(keyMap[newReaction]);
                  return { ...c, reactions: Object.keys(reactions).length ? reactions : undefined };
                }
                return c;
              }),
            };
          });
          queryClient.setQueryData(key as QueryKey, { ...pagesWrap, pages: newPages });
        }
      });

      setReaction(newReaction);
      // Fire network call (create/update/delete)
      sendReaction({ postId, commentId, reaction: newReaction });
    },
    [reaction, queryClient, postId, commentId, sendReaction],
  );

  const currentConfig =
    reaction && isSupportedReaction(reaction) ? reactionConfig[reaction] : null;

  const reactionsList = useMemo(
    () =>
      SUPPORTED_REACTIONS.map((reactionType) => ({
        type: reactionType,
        config: reactionConfig[reactionType],
      })),
    [],
  );
  return (
    <HoverCard
      openDelay={400}
      closeDelay={200}
      open={isHoverCardOpen}
      onOpenChange={setIsHoverCardOpen}
    >
      <HoverCardTrigger
        asChild
        className={cn(
          'flex text-xs gap-1 items-center cursor-pointer hover:bg-slate-50 py-2 justify-center',
        )}
        onClick={() => handleReaction(Reaction.THUMBS_UP)}
      >
        <Button color="tertiary" size="sm" className="h-6 text-xs px-2">
          {reaction !== null && (
            <Image
              width={14}
              height={14}
              alt={currentConfig?.text || 'Like'}
              src={currentConfig?.icon || likeFalseEmoji}
            />
          )}
          <div className="text-xs text-center select-none">
            {currentConfig?.text || 'Like'}
          </div>
        </Button>
        {/* <button className="flex w-full gap-1 items-center cursor-pointer justify-center">
          <Image
            width={18}
            height={18}
            alt={currentConfig?.text || 'Like'}
            src={currentConfig?.icon || likeFalseEmoji}
          />
          <div
            className="text-sm text-center select-none"
            style={{ color: currentConfig?.color || '#6B7280' }}
          >
            {currentConfig?.text || 'Like'}
          </div>
        </button> */}
      </HoverCardTrigger>

      <HoverCardContent
        className="flex items-center relative w-fit h-fit"
        side="top"
      >
        {reactionsList.map(({ type, config }) => (
          <Image
            key={type}
            height={config.size}
            alt={config.text}
            src={config.icon}
            className="hover:scale-125 transition duration-300 ease-in-out cursor-pointer px-2"
            onClick={() => handleReaction(type)}
          />
        ))}
      </HoverCardContent>
    </HoverCard>
  );
};

export default memo(CommentInteraction);

type SupportedReaction = (typeof SUPPORTED_REACTIONS)[number];

const isSupportedReaction = (
  reaction: Reaction,
): reaction is SupportedReaction => {
  return SUPPORTED_REACTIONS.includes(reaction as SupportedReaction);
};

const SMALL_ICON_SIZE = 44;
const LARGE_ICON_SIZE = 48;

const SUPPORTED_REACTIONS = [
  Reaction.THUMBS_UP,
  Reaction.ROCKET,
  Reaction.LAUGH,
  Reaction.THINKING,
  Reaction.HEART,
  Reaction.COTILLON,
] as const;

export const reactionConfig = {
  [Reaction.THUMBS_UP]: {
    icon: likeTrueEmoji,
    color: '#004182',
    text: 'Like',
    size: SMALL_ICON_SIZE,
  },
  [Reaction.ROCKET]: {
    icon: celebrateEmoji,
    color: '#165209',
    text: 'Celebrate',
    size: LARGE_ICON_SIZE,
  },
  [Reaction.LAUGH]: {
    icon: funnyEmoji,
    color: '#104E58',
    text: 'Funny',
    size: SMALL_ICON_SIZE,
  },
  [Reaction.THINKING]: {
    icon: insightfulEmoji,
    color: '#5D3B01',
    text: 'Insightful',
    size: LARGE_ICON_SIZE,
  },
  [Reaction.HEART]: {
    icon: loveEmoji,
    color: '#77280C',
    text: 'Love',
    size: SMALL_ICON_SIZE,
  },
  [Reaction.COTILLON]: {
    icon: supportEmoji,
    color: '#493D57',
    text: 'Support',
    size: LARGE_ICON_SIZE,
  },
};
