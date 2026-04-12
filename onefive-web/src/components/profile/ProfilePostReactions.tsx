'use client';

import { useMemo } from 'react';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { tempReactionType } from '@/features/post/post.api';

const reactionIcons = {
  like: likeTrueEmoji,
  celebrate: celebrateEmoji,
  funny: funnyEmoji,
  insightful: insightfulEmoji,
  love: loveEmoji,
  support: supportEmoji,
};

interface ProfilePostReactionsProps {
  reactions?: tempReactionType;
  reactionCount: number;
  commentCount: number;
}

export function ProfilePostReactions({
  reactions,
  reactionCount,
  commentCount
}: ProfilePostReactionsProps) {
  const sortedReactions = useMemo(() => {
    if (!reactions) return [];
    const reactionEntries = Object.entries(reactions) as [string, number][];
    return reactionEntries
      .filter(([_, count]) => count && count > 0)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 3);
  }, [reactions]);

  if (reactionCount === 0 && commentCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      {/* Réactions */}
      {reactionCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="group flex -space-x-1 transition-transform duration-100 ease-in hover:space-x-0">
            {sortedReactions.map(([type], index) => {
              const iconSrc = reactionIcons[type as keyof typeof reactionIcons];
              if (!iconSrc) return null;

              return (
                <div
                  key={type}
                  className={cn(
                    'w-4 h-4 rounded-full border border-white',
                    'bg-white flex items-center justify-center transition-all duration-300 ease-in-out',
                    index > 0 && '-ml-1 group-hover:ml-0',
                  )}
                  style={{ zIndex: sortedReactions.length - index }}
                >
                  <Image
                    src={iconSrc}
                    alt={`${type} reaction`}
                    width={12}
                    height={12}
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            })}
          </div>
          <span className="font-medium">{reactionCount}</span>
        </div>
      )}

      {/* Commentaires */}
      {commentCount > 0 && (
        <div className="flex items-center gap-1">
          <span className="font-medium">{commentCount}</span>
          <span className="text-gray-400">
            {commentCount === 1 ? 'commentaire' : 'commentaires'}
          </span>
        </div>
      )}
    </div>
  );
}

