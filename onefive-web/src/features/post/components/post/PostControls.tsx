'use client';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Reaction } from '@/enums';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import Image from 'next/image';
import { MessageCircle, Repeat2, SquarePen, Bookmark, Share, AlertTriangle } from 'lucide-react';
import likeFalseEmoji from '@/icons/reactions/like-false.svg';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import { cn } from '@/lib/utils';
import { useReaction } from '../../hooks/mutations';
import { useRepost } from '../../hooks/mutations/useRepost';
import { useToggleBookmark } from '@/hooks/useFeedExtra';
import { ReportModal } from '@/components/modals/ReportModal';
import { toast } from 'sonner';

interface PostControlsProps {
  currentReaction: Reaction | null;
  isReposted: boolean;
  isBookmarked?: boolean;
  toggleComment: () => void;
  postId: string;
  createdAt: string;
  onRepostWithThoughts?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}
const PostControls: React.FC<PostControlsProps> = ({
  currentReaction,
  isReposted,
  isBookmarked = false,
  toggleComment,
  postId,
  createdAt,
  onRepostWithThoughts,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const [isHoverCardOpen, setIsHoverCardOpen] = useState(false);
  const [isRepost, setIsRepost] = useState(isReposted);
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked);
  const [reaction, setReaction] = useState(currentReaction);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { mutate: createReaction } = useReaction();
  const { mutate: repost } = useRepost();
  const { mutateAsync: toggleBookmark, isLoading: isTogglingBookmark } = useToggleBookmark();

  // Synchroniser l'état local avec les props
  useEffect(() => {
    setReaction(currentReaction);
  }, [currentReaction]);

  useEffect(() => {
    setIsBookmarkedState(isBookmarked);
  }, [isBookmarked]);

  const handleSimpleRepost = useCallback(() => {
    if (disabled) return;
    repost({ postId });
    setTimeout(() => {
      setIsRepost(!isRepost);
    }, 250);
  }, [postId, repost, isRepost, disabled]);

  const handleShare = useCallback(async () => {
    if (disabled) return;
    const url = `${window.location.origin}/post/${postId}`;
    // Share natif (mobile) si dispo, sinon copie du lien.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        /* annulé ou non supporté → fallback copie */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  }, [postId, disabled]);

  const handleBookmarkToggle = useCallback(async () => {
    try {
      const result = await toggleBookmark(postId);
      setIsBookmarkedState(result.bookmarked);
    } catch (error) {
      console.error('Erreur lors du toggle bookmark:', error);
    }
  }, [postId, toggleBookmark]);

  // Check if user can still edit (within 15 minutes)
  const canEditWithinTime = useMemo(() => {
    if (!onEdit) return false;
    const now = new Date().getTime();
    const createdTime = new Date(createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    return (now - createdTime) <= fifteenMinutes;
  }, [createdAt, onEdit]);

  const handleReaction = useCallback(
    (nextReaction: Reaction) => {
      const isSameReaction = reaction === nextReaction;
      const newReaction = isSameReaction ? null : nextReaction;

      setReaction(newReaction);
      createReaction({ postId, reaction: newReaction });
      setIsHoverCardOpen(false);
    },
    [reaction, postId, createReaction],
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
    <div className="flex border-gray-100">
      <HoverCard
        openDelay={400}
        closeDelay={200}
        open={isHoverCardOpen}
        onOpenChange={setIsHoverCardOpen}
      >
        <HoverCardTrigger
          asChild
          className={cn(
            "flex flex-1 gap-1 items-center py-2 justify-center",
            disabled 
              ? "cursor-not-allowed opacity-50" 
              : "cursor-pointer hover:bg-slate-50"
          )}
          onClick={disabled ? undefined : () => handleReaction(Reaction.THUMBS_UP)}
        >
          <button 
            className="flex w-full gap-2 items-center justify-center"
            disabled={disabled}
          >
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
          </button>
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
      <button
        className={cn(
          "flex-1 flex items-center justify-center py-1 text-gray-500 rounded",
          disabled 
            ? "cursor-not-allowed opacity-50" 
            : "hover:bg-gray-50"
        )}
        onClick={disabled ? undefined : toggleComment}
        disabled={disabled}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Comment</span>
      </button>
      <Dropdown.Root>
        <Dropdown.Trigger
          className={cn(
            'flex-1 flex items-center justify-center py-1 text-gray-500 rounded',
            disabled 
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-50 cursor-pointer',
            isRepost && !disabled && 'text-success-700',
          )}
          isDisabled={disabled}
        >
          <Repeat2 className="h-5 w-5 mr-2" />
          <p className="text-sm">Repost</p>
        </Dropdown.Trigger>
        
        <Dropdown.Popover className="w-80">
          <Dropdown.Menu>
            <Dropdown.Section>
              <Dropdown.Item 
                unstyled
                onAction={handleSimpleRepost}
              >
                <div className="flex items-start gap-2 px-2.5 py-2">
                  <Repeat2 className="h-7 w-7 mr-2 stroke-gray-500" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                      {isRepost ? 'Undo repost' : 'Repost'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isRepost
                        ? 'Remove this post from your feed.'
                        : 'Repost this to your feed so your followers can see it.'}
                    </p>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item 
                unstyled
                onAction={onRepostWithThoughts}
              >
                <div className="flex items-start gap-2 px-2.5 py-2">
                  <SquarePen className="h-6 w-6 mr-2 stroke-gray-500" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                      Repost and give your thoughts
                    </p>
                    <p className="text-xs text-gray-500">
                      Repost this to your feed and give your thoughts.
                    </p>
                  </div>
                </div>
              </Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
      <button
        className={cn(
          'flex-1 flex items-center justify-center py-1 text-gray-500 rounded',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
        )}
        onClick={disabled ? undefined : handleShare}
        disabled={disabled}
      >
        <Share className="h-4 w-4 mr-2" />
        <span className="text-sm">Partager</span>
      </button>
      {/* Actions principales seulement : Like, Comment, Repost, Share, More */}
      <Dropdown.Root>
        <Dropdown.DotsButton />
        
        <Dropdown.Popover className="w-60">
          <Dropdown.Menu>
            <Dropdown.Section>
              {/* Save/Bookmark Action */}
              {isBookmarkedState ? (
                <Dropdown.Item
                  icon={Bookmark}
                  onAction={handleBookmarkToggle}
                >
                  <span className="text-[#5E6AD2] font-semibold">
                    {isTogglingBookmark ? 'Loading...' : 'Remove from saved'}
                  </span>
                </Dropdown.Item>
              ) : (
                <Dropdown.Item
                  icon={Bookmark}
                  onAction={handleBookmarkToggle}
                >
                  {isTogglingBookmark ? 'Loading...' : 'Save post'}
                </Dropdown.Item>
              )}
              
              {/* Copy link (le bouton Partager de la barre gère le share natif) */}
              <Dropdown.Item icon={Share} onAction={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
                  .then(() => toast.success('Lien copié'))
                  .catch(() => toast.error('Impossible de copier le lien'));
              }}>
                Copier le lien du post
              </Dropdown.Item>
            </Dropdown.Section>
            
            {(onEdit || onDelete) && <Dropdown.Separator />}
            
            {(onEdit || onDelete) && (
              <Dropdown.Section>
                {/* Edit Action */}
                {canEditWithinTime && onEdit && (
                  <Dropdown.Item icon={SquarePen} onAction={onEdit}>
                    Edit post
                  </Dropdown.Item>
                )}
                {onEdit && !canEditWithinTime && (
                  <Dropdown.Item icon={SquarePen} className="opacity-50 cursor-not-allowed">
                    Edit post (15 min expired)
                  </Dropdown.Item>
                )}
                
                {/* Delete Action */}
                {onDelete && (
                  <Dropdown.Item onAction={onDelete} className="text-red-600">
                    Delete post
                  </Dropdown.Item>
                )}
              </Dropdown.Section>
            )}
            
            <Dropdown.Separator />
            
            <Dropdown.Section>
              <Dropdown.Item icon={AlertTriangle} onAction={() => setIsReportOpen(true)} className="text-red-500">
                Report post
              </Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        resourceType="POST"
        resourceId={postId}
      />
    </div>
  );
};

export default memo(PostControls);

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
