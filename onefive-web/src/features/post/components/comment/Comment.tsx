import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Button } from '@/components/base/buttons/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { CommentType } from '../../definitions/comment.definition';
import { formatDistance } from 'date-fns';
import CommentReply from '../reply/Reply';
import ReplyForm from '../reply/ReplyForm';
import CommentInteraction from './CommentInteraction';
import CommentReactionsModal from './CommentReactionsModal';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { selfProfile } from '@/queries/profile';
import EditCommentForm from './EditCommentForm';
import { useDeleteComment } from '../../hooks/mutations/useDeleteComment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { ReportModal } from '@/components/modals/ReportModal';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

const _reactionIcons = {
  like: likeTrueEmoji,
  celebrate: celebrateEmoji,
  funny: funnyEmoji,
  insightful: insightfulEmoji,
  love: loveEmoji,
  support: supportEmoji,
};

interface Props {
  comment: CommentType;
}

const Comment: React.FC<Props> = ({ comment }) => {
  const {
    avatar,
    author,
    content,
    createdAt,
    updatedAt,
    replies,
    id,
    postId,
    reactions,
    reactionCount,
    profileId,
  } = comment;
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [openReactions, setOpenReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { navigateToConversation } = useNavigateToConversation();
  const formattedCreateAt = useMemo(() => {
    try {
      const createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) {
        return 'Date inconnue';
      }
      return formatDistance(createdDate, new Date(), {
        addSuffix: false,
        includeSeconds: false,
      });
    } catch {
      return 'Date inconnue';
    }
  }, [createdAt]);

  // Fetch current user's profile to determine ownership
  const { data: meProfile } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
    staleTime: 5 * 60 * 1000,
  });

  const { mutateAsync: deleteComment, isLoading: isDeleting } = useDeleteComment();

  const canEdit = !!(profileId && meProfile && meProfile.id === profileId);

  // Check if comment was edited (and after the 15-minute grace period)
  const isEdited = useMemo(() => {
    if (createdAt === updatedAt) return false;
    const createdTime = new Date(createdAt).getTime();
    const updatedTime = new Date(updatedAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    return (updatedTime - createdTime) > fifteenMinutes;
  }, [createdAt, updatedAt]);

  // Check if user can still edit (within 15 minutes)
  const canEditWithinTime = useMemo(() => {
    if (!canEdit) return false;
    const now = new Date().getTime();
    const createdTime = new Date(createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    return (now - createdTime) <= fifteenMinutes;
  }, [createdAt, canEdit]);

  const _sortedReactions = useMemo(() => {
    if (!reactions) return [];
    const reactionEntries = Object.entries(reactions);
    return reactionEntries
      .filter(([_, count]) => count && count > 0)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 3);
  }, [reactions]);

  const toggleReply = useCallback(() => {
    setIsReplyOpen((prev) => !prev);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback(() => {
    setOpenDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteComment(id);
      setOpenDelete(false);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setOpenDelete(false);
    }
  }, [deleteComment, id]);
  const isPending = (comment as any).isPending;
  
  // Parse firstName/lastName from author string
  const nameParts = author?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
  <div className={cn('flex gap-2 transition-opacity duration-500', isPending ? 'opacity-60 select-none' : 'opacity-100')}>    
      <UserMiniProfile
        profileId={profileId}
        firstName={firstName}
        lastName={lastName}
        avatar={avatar}
        highlight={comment.about}
        bio={comment.about}
        countryCode={comment.countryCode}
        countryName={comment.countryName}
        isFollowing={comment.isFollowing}
        ecosystemRoles={comment.ecosystemRoles}
        stats={comment.stats}
        streak={comment.streak}
        badges={comment.badges}
        size="sm"
        onMessage={profileId ? () => navigateToConversation(profileId) : undefined}
      />
      <div className="flex-1">
        <div className={cn('bg-muted p-2.5 rounded-lg relative', isPending && 'border border-dashed border-gray-300')}>          
          {isPending && (
            <div className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sending…
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium">{author}</p>
              <p className="text-xs text-muted-foreground">
                {formattedCreateAt}
                {isEdited && (
                  <span className="text-gray-400 italic ml-1">(modifié)</span>
                )}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button color="tertiary" size="sm" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy text</DropdownMenuItem>
                {canEditWithinTime && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEdit}>
                      Edit comment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete comment'}
                    </DropdownMenuItem>
                  </>
                )}
                {canEdit && !canEditWithinTime && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-gray-400">
                      Edit comment (15 min expired)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete comment'}
                    </DropdownMenuItem>
                  </>
                )}
                {!canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => setIsReportOpen(true)}>
                      Report comment
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
              resourceType="POST_COMMENT"
              resourceId={id}
            />
          </div>
          {isEditing ? (
            <div className="mt-1">
              <EditCommentForm
                commentId={id}
                initialContent={content}
                onCancel={handleCancelEdit}
                onSave={handleSaveEdit}
              />
            </div>
          ) : (
            <p className="text-sm mt-1">{content}</p>
          )}
        </div>
        <div className="flex gap-2 mt-1 ml-1">
          <div className="flex gap-2 items-center">
            {/* <div className="text-xs">
              {comment.reactions.length > 0 && (
                <>
                  {comment.reactions.map((reaction) => {
                    return (
                      <Image
                        key={reaction.id}
                        src={reaction.reaction}
                        alt={reaction.reaction}
                        width={14}
                        height={14}
                      />
                    );
                  })}
                </>
              )}
              {comment.reactionCount > 0 && (
                <>
                  <span className="text-xs">{comment.reactionCount}</span>
                </>
              )}
            </div> */}
            {/* <div className="group flex -space-x-2 transition-transform duration-100 ease-in hover:space-x-0">
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
            </div> */}
          {reactionCount > 0 && (
            <Button
              color="tertiary"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setOpenReactions(true)}
            >
              {reactionCount} {reactionCount === 1 ? 'Reaction' : 'Reactions'}
            </Button>
          )}
            <CommentInteraction postId={postId} commentId={id} currentCommentReaction={comment.userReaction || null} />
          </div>
          {isReplyOpen && (
            <Button
              onClick={toggleReply}
              color="tertiary"
              size="sm"
              className="h-6 text-xs px-2"
            >
              Cancel
            </Button>
          )}
          {!isReplyOpen && (
            <Button
              onClick={toggleReply}
              color="tertiary"
              size="sm"
              className="h-6 text-xs px-2"
            >
              Reply
            </Button>
          )}
        </div>
        {isReplyOpen && (
          <ReplyForm parentId={id} parentAuthor={author} postId={postId} />
        )}
        {Array.isArray(replies) && replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentReply key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
      <CommentReactionsModal
        open={openReactions}
        onOpenChange={setOpenReactions}
        postId={postId}
        commentId={id}
        reactions={reactions}
      />
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(Comment);
