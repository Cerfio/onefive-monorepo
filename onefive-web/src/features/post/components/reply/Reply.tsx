import { formatDistance } from 'date-fns';
import { memo, useMemo, useState, useCallback } from 'react';
import { ReplyType } from '../../definitions/comment.definition';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Button } from '@/components/base/buttons/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommentInteraction from '../comment/CommentInteraction';
import CommentReactionsModal from '../comment/CommentReactionsModal';
import { useQuery } from '@tanstack/react-query';
import { selfProfile } from '@/queries/profile';
import EditReplyForm from './EditReplyForm';
import { useDeleteComment } from '../../hooks/mutations/useDeleteComment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/base/dialog/alert-dialog';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { ReportModal } from '@/components/modals/ReportModal';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

interface CommentReplyProps {
  reply: ReplyType;
}

const Reply: React.FC<CommentReplyProps> = ({ reply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openReactions, setOpenReactions] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { navigateToConversation } = useNavigateToConversation();
  const formattedCreateAt = useMemo(() => {
    try {
      const createdDate = new Date(reply.createdAt);
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
  }, [reply.createdAt]);

  // Fetch current user's profile to determine ownership
  const { data: meProfile } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
    staleTime: 5 * 60 * 1000,
  });

  const { mutateAsync: deleteReply, isLoading: isDeleting } = useDeleteComment();

  const canEdit = !!(reply.profileId && meProfile && meProfile.id === reply.profileId);

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
      await deleteReply(reply.id);
      setOpenDelete(false);
    } catch (error) {
      console.error('Failed to delete reply:', error);
      setOpenDelete(false);
    }
  }, [deleteReply, reply.id]);
  const isPending = (reply as any).isPending;
  
  // Parse firstName/lastName from author string
  const nameParts = reply.author?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
  <div className={cn('flex gap-2 transition-opacity duration-500', isPending ? 'opacity-60 select-none' : 'opacity-100')}>    
      <UserMiniProfile
        profileId={reply.profileId}
        firstName={firstName}
        lastName={lastName}
        avatar={reply.avatar}
        highlight={reply.about}
        bio={reply.about}
        countryCode={reply.countryCode}
        countryName={reply.countryName}
        isFollowing={reply.isFollowing}
        ecosystemRoles={reply.ecosystemRoles}
        stats={reply.stats}
        streak={reply.streak}
        badges={reply.badges}
        size="sm"
        onMessage={reply.profileId ? () => navigateToConversation(reply.profileId!) : undefined}
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
              <h4 className="text-xs font-medium">{reply.author}</h4>
              <p className="text-xs text-muted-foreground">
                {formattedCreateAt}
              </p>
            </div>
            <Dropdown.Root>
              <Dropdown.Trigger>
                <Button color="tertiary" size="sm" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom right">
                <Dropdown.Menu>
                  <Dropdown.Item>Copy text</Dropdown.Item>
                  {canEdit && (
                    <>
                      <Dropdown.Separator />
                      <Dropdown.Item onAction={handleEdit}>
                        Edit reply
                      </Dropdown.Item>
                      <Dropdown.Item
                        onAction={handleDelete}
                        isDisabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete reply'}
                      </Dropdown.Item>
                    </>
                  )}
                  {!canEdit && (
                    <>
                      <Dropdown.Separator />
                      <Dropdown.Item onAction={() => setIsReportOpen(true)}>
                        Report reply
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
            <ReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
              resourceType="POST_COMMENT_REPLY"
              resourceId={reply.id}
            />
          </div>

          {isEditing ? (
            <div className="mt-1">
              <EditReplyForm
                replyId={reply.id}
                initialContent={reply.content}
                onCancel={handleCancelEdit}
                onSave={handleSaveEdit}
              />
            </div>
          ) : (
            <p className="text-sm mt-1">{reply.content}</p>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {reply.reactionCount > 0 && (
            <Button
              color="tertiary"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => reply.postId && setOpenReactions(true)}
            >
              {reply.reactionCount} {reply.reactionCount === 1 ? 'Reaction' : 'Reactions'}
            </Button>
          )}
          {reply.postId && (
            <CommentInteraction postId={reply.postId} commentId={reply.id} currentCommentReaction={reply.userReaction || null} />
          )}
        </div>
      </div>
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your reply.
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
      {reply.postId && (
        <CommentReactionsModal
          open={openReactions}
          onOpenChange={setOpenReactions}
          postId={reply.postId}
          commentId={reply.id}
          // Les replies utilisent un tableau de réactions détaillées; le modal attend un agrégat (counts), on passe undefined ici
          reactions={undefined}
        />
      )}
    </div>
  );
};

export default memo(Reply);
