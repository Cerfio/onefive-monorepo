'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/base/dialog/dialog';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { useRepost } from '../../hooks/mutations/useRepost';

interface RepostWithThoughtsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSuccess?: () => void;
}

export default function RepostWithThoughtsModal({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: RepostWithThoughtsModalProps) {
  const [thoughts, setThoughts] = useState('');
  const { mutate: repost, isPending } = useRepost();

  // Reset thoughts when modal opens
  useEffect(() => {
    if (open) {
      setThoughts('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!thoughts.trim()) {
      return;
    }

    repost(
      { postId, content: thoughts.trim() },
      {
        onSuccess: () => {
          setThoughts('');
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setThoughts('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Repost and give your thoughts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <TextArea
              placeholder="What are your thoughts?"
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="min-h-[120px] resize-none"
              isDisabled={isPending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Share your thoughts about this post with your followers.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            color="secondary"
            onClick={handleClose}
            isDisabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isDisabled={!thoughts.trim() || isPending}
          >
            {isPending ? 'Reposting...' : 'Repost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

