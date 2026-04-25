import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { useEditComment } from '../../hooks/mutations/useEditComment';

interface EditCommentFormProps {
  commentId: string;
  initialContent: string;
  onCancel: () => void;
  onSave: () => void;
}

const EditCommentForm: React.FC<EditCommentFormProps> = ({
  commentId,
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
        { commentId, data: { content: content.trim() } },
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
      <TextArea
        ref={textareaRef}
        value={content}
        onChange={setContent}
        onKeyDown={handleKeyDown}
        placeholder="Modifier votre commentaire..."
        className="min-h-[60px] resize-none border-gray-300 focus:border-[#5E6AD2] focus:ring-[#5E6AD2]"
        isDisabled={isLoading}
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
            isDisabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            color="primary"
            size="sm"
            isDisabled={!content.trim() || content.trim() === initialContent.trim() || isLoading}
            className="h-7 px-3 text-xs"
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditCommentForm;