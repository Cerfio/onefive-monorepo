'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { MessageCircle, CheckCircle, Eye } from 'lucide-react';
import { useToggleProfileFollow } from '@/hooks/useFollow';

interface PostAuthorActionsProps {
  profileId: string;
  authorName: string;
  isFollowing?: boolean;
  className?: string;
}

export const PostAuthorActions = ({
  profileId,
  authorName: _authorName,
  isFollowing = false,
  className = ''
}: PostAuthorActionsProps) => {
  const [following, setFollowing] = useState(isFollowing);
  const followProfile = useToggleProfileFollow();

  const handleFollow = () => {
    setFollowing(!following);
    followProfile.toggle(profileId, following);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        size="sm"
        color={following ? 'secondary' : 'primary'}
        className="flex-1"
        disabled={followProfile.isLoading}
        onClick={handleFollow}
        iconLeading={following ? <CheckCircle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      >
        {followProfile.isLoading ? '...' : (following ? 'Suivi' : 'Suivre')}
      </Button>
      <Button
        size="sm"
        color="secondary"
        className="flex-1"
        iconLeading={<MessageCircle className="h-4 w-4" />}
      >
        Message
      </Button>
    </div>
  );
};
