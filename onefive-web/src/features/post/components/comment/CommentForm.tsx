'use client';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMe } from '@/hooks/useUser';
import { useCreateComment } from '../../hooks/mutations';
import { forwardRef, useState } from 'react';

interface Props {
  ref: React.RefObject<HTMLTextAreaElement>;
  postId: string;
  parentId?: string;
  onCommentCreated?: () => void;
}

const CommentForm = forwardRef<HTMLTextAreaElement, Props>(({
  postId,
  parentId,
  onCommentCreated
}, ref) => {
  const [comment, setComment] = useState('');
  const { data: profile } = useMe();
  const createCommentMutation = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        content: comment.trim(),
        parentId,
      });

      setComment('');
      onCommentCreated?.();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <Avatar 
        size="sm"
        src={profile?.avatar}
        alt={`${profile?.firstName} ${profile?.lastName} avatar`}
        firstName={profile?.firstName}
        lastName={profile?.lastName}
      />
      <div className="flex-1">
        <Textarea
          placeholder={parentId ? "Add a reply..." : "Add a comment..."}
          className="resize-none min-h-[60px] text-sm focus-visible:ring-0"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          ref={ref}
          disabled={createCommentMutation.isPending}
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            size="sm"
            disabled={!comment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  );
});

export default CommentForm;
