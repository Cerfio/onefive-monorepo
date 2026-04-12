import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { useEditComment } from '../../hooks/mutations/useEditComment';

interface EditReplyFormProps {
  replyId: string;
  initialContent: string;
  onCancel: () => void;
  onSave: () => void;
}

const EditReplyForm: React.FC<EditReplyFormProps> = ({
  replyId,
  initialContent,
  onCancel,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: editComment, isLoading } = useEditComment();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at the end
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === initialContent.trim()) {
      onCancel();
      return;
    }

    if (content.trim()) {
      editComment(
        { commentId: replyId, data: { content: content.trim() } },
        {
          onSuccess: () => {
            onSave();
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Modifier votre réponse..."
        className="min-h-[60px] resize-none border-gray-300 focus:border-[#5E6AD2] focus:ring-[#5E6AD2]"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="text-xs text-gray-500">
          Appuyez sur Ctrl+Entrée pour sauvegarder
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            color="primary"
            size="sm"
            disabled={!content.trim() || content.trim() === initialContent.trim() || isLoading}
            className="h-7 px-3 text-xs"
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditReplyForm;