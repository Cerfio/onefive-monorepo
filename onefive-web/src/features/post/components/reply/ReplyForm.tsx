import { Button } from '@/components/ui';
import { TextArea } from '@/components/base/textarea/textarea';
import { memo, useCallback, useState } from 'react';
import { useCreateComment } from '../../hooks/mutations/useCreateComment';

interface Props {
  parentId: string;
  parentAuthor: string;
  postId: string;
}

const ReplyForm: React.FC<Props> = ({ parentId, parentAuthor, postId }) => {
  const [reply, setReply] = useState('');
  const { mutate: createComment, isPending } = useCreateComment();
  const handleReply = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createComment({ content: reply, parentId, postId });
    setReply('');
  }, [reply, parentId, postId, createComment]);

  return (
    <form onSubmit={handleReply} className="flex-1 mt-2">
      <TextArea
        placeholder={`Reply to ${parentAuthor}`}
        className="resize-none min-h-[60px] text-sm focus-visible:ring-0"
        value={reply}
        onChange={setReply}
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" className="h-8" disabled={!reply.trim() || isPending}>
          {isPending ? 'Replying...' : 'Reply'}
        </Button>
      </div>
    </form>
  );
};

export default memo(ReplyForm);
