import { useMemo } from 'react';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import { tempReactionType } from '../../post.api';

const reactionIcons = {
  like: likeTrueEmoji,
  celebrate: celebrateEmoji,
  funny: funnyEmoji,
  insightful: insightfulEmoji,
  love: loveEmoji,
  support: supportEmoji,
};

interface PostInteractionsProps {
  reactions?: tempReactionType;
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  toggleComment: () => void;
  onOpenReactions?: () => void;
  disabled?: boolean;
}

const PostInteractions: React.FC<PostInteractionsProps> = ({
  reactions,
  reactionCount,
  commentCount,
  repostCount,
  toggleComment,
  onOpenReactions = () => {},
  disabled = false,
}) => {
  const sortedReactions = useMemo(() => {
    if (!reactions) return [];
    const reactionEntries = Object.entries(reactions);
    return reactionEntries
      .filter(([_, count]) => count && count > 0)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 3);
  }, [reactions]);

  return (
    <div
      className={cn(
        'flex py-2 justify-between items-center text-xs text-muted-foreground',
        disabled && 'pointer-events-none opacity-70'
      )}
    >
      <div className="flex items-center">
        {reactionCount === 0 ? (
          <span className="text-muted-foreground">aucune réaction</span>
        ) : (
          <>
            <div className="group flex -space-x-2 transition-transform duration-100 ease-in hover:space-x-0">
              {sortedReactions.map(([type], index) => (
                <div
                  key={type}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 border-white',
                    'bg-white flex items-center justify-center transition-all duration-300 ease-in-out',
                    index > 0 && '-ml-1 group-hover:ml-0',
                  )}
                  style={{ zIndex: sortedReactions.length - index }}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Image
                      src={reactionIcons[type as keyof typeof reactionIcons]}
                      alt={`${type} reaction`}
                      width={16}
                      height={16}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
            {onOpenReactions ? (
              <button
                className="ml-2"
                onClick={disabled ? undefined : onOpenReactions}
                disabled={disabled}
              >
                <NumberFlow value={reactionCount} />
              </button>
            ) : (
              <span className="ml-2">
                <NumberFlow value={reactionCount} />
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {commentCount === 0 && repostCount === 0 ? (
          <span className="text-muted-foreground">aucun commentaire</span>
        ) : (
          <>
            <button
              onClick={disabled ? undefined : toggleComment}
              className="flex items-center gap-1 hover:underline"
              disabled={disabled}
            >
              {commentCount === 0 ? (
                <span>aucun commentaire</span>
              ) : (
                <NumberFlowGroup>
                  <NumberFlow value={commentCount} />
                  <span>{commentCount === 1 ? 'comment' : 'comments'}</span>
                </NumberFlowGroup>
              )}
            </button>
            <span>•</span>
            <button className="hover:underline" disabled={disabled}>
              {repostCount === 0 ? 'aucun repost' : `${repostCount} reposts`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostInteractions;
