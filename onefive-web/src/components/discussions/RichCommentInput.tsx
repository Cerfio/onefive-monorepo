import { Button } from '@/components/base/buttons/button';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TextAreaBase } from '@/components/base/textarea/textarea';
import { Avatar } from '@/components/base/avatar/avatar';
import { useMe } from '@/hooks/useUser';

const RichCommentInput = ({
  replyTo,
  callback,
  cancelCallback: _cancelCallback,
  comment,
  setComment,
  parentId: _parentId
}: {
  replyTo?: string;
  callback: () => void;
  cancelCallback?: () => void;
  comment: string;
  setComment: (comment: string) => void;
  parentId?: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: user } = useMe();

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await callback();
      toast.success('Commentaire publié !');
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar 
        src={user?.avatar}
        size="md"
        firstName={user?.firstName}
        lastName={user?.lastName}
        alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
      />
      <div className="flex-1 flex gap-2">
        <TextAreaBase
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={replyTo ? `Répondre à ${replyTo}...` : "Écrire un commentaire..."}
          className="flex-1 min-h-[44px] resize-none"
          rows={1}
        />
        <Button
          color="primary"
          size="md"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!comment.trim() || isSubmitting}
          iconLeading={<Send className="w-4 h-4" />}
        >
          {isSubmitting ? 'Envoi...' : 'Publier'}
        </Button>
      </div>
    </div>
  );
};

export default RichCommentInput; 