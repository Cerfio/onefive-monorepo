"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import likeTrueEmoji from '@/icons/reactions/like-true.svg';
import celebrateEmoji from '@/icons/reactions/celebrate.svg';
import funnyEmoji from '@/icons/reactions/funny.svg';
import insightfulEmoji from '@/icons/reactions/insightful.svg';
import loveEmoji from '@/icons/reactions/love.svg';
import supportEmoji from '@/icons/reactions/support.svg';
import { Button } from '@/components/ui';
import type { tempReactionType } from '../../post.api';
import { Reaction } from '@/enums';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';

const iconByKey: Record<keyof NonNullable<tempReactionType>, any> = {
  like: likeTrueEmoji,
  celebrate: celebrateEmoji,
  funny: funnyEmoji,
  insightful: insightfulEmoji,
  love: loveEmoji,
  support: supportEmoji,
};

// Mapping entre les valeurs de l'enum Reaction et les clés de iconByKey
const reactionToIconKey: Record<Reaction, keyof typeof iconByKey> = {
  [Reaction.THUMBS_UP]: 'like',
  [Reaction.ROCKET]: 'celebrate',
  [Reaction.LAUGH]: 'funny',
  [Reaction.THINKING]: 'insightful',
  [Reaction.HEART]: 'love',
  [Reaction.COTILLON]: 'support',
  // Autres réactions non supportées pour l'instant
  [Reaction.CRY]: 'like',
  [Reaction.EYES]: 'like',
  [Reaction.SMILE]: 'like',
  [Reaction.THUMBS_DOWN]: 'like',
};

export interface CommentReactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  commentId: string;
  reactions?: tempReactionType;
}

export default function CommentReactionsModal({ open, onOpenChange, postId, commentId, reactions }: CommentReactionsModalProps) {
  // Don't render if IDs are not available
  if (!postId || !commentId) {
    return null;
  }

  const groups = Object.entries(reactions || {})
    .filter(([, count]) => (count || 0) > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));

  // Fetch full comment reactions (users) when open
  const { data } = useQuery<any>({
    queryKey: ['post-comment-reactions', commentId],
    queryFn: async () => {
      const res = await api.get(`post-comment-reactions/comments/${commentId}`);
      return res.json();
    },
    enabled: open && !!commentId && !!postId,
    staleTime: 30_000,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>All reactions</DialogTitle>
          <DialogDescription>
            Comment #{commentId.slice(0, 6)}{postId ? ` • Post #${postId.slice(0, 6)}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {groups.length === 0 && (
            <div className="text-sm text-gray-500">No reactions yet.</div>
          )}

          {groups.map(([key, count]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded-md border">
              <div className="flex items-center gap-2">
                <Image src={iconByKey[key as keyof typeof iconByKey]} alt={`${key} icon`} width={18} height={18} />
                <span className="capitalize text-sm">{key}</span>
              </div>
              <span className="text-sm text-gray-600">{count}</span>
            </div>
          ))}

          {open && data?.data && (
            <div className="rounded-md border p-3 text-sm text-gray-700 space-y-2 max-h-64 overflow-auto">
              {data.data.map((r: any) => {
                const iconKey = reactionToIconKey[r.reaction as Reaction];
                const iconSrc = iconKey ? iconByKey[iconKey] : likeTrueEmoji;
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <Image src={iconSrc} alt="icon" width={16} height={16} />
                    <img src={r.profile?.avatar || '/default-avatar.png'} alt="avatar" className="w-5 h-5 rounded-full" />
                    <span>{r.profile?.name || r.profileId}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
