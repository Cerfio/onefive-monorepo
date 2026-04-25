'use client';

import { Avatar } from '@/components/base/avatar/avatar';
import { useMe } from '@/hooks/useUser';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Tooltip } from '@/components/base/tooltip/tooltip';

interface CreatePostButtonProps {
  onClick: () => void;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  onClick,
}) => {
  const { data: user, isLoading } = useMe();
  const { isWaiting, isLoading: waitlistLoading } = useWaitlistStatus();

  const isDisabled = isWaiting;

  const button = (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        'w-full bg-white rounded-lg border border-gray-200 p-3',
        'flex items-center gap-3 group',
        isDisabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer',
      )}
    >
      {isLoading || waitlistLoading ? (
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      ) : (
        user && (
          <Avatar
            size="sm"
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            firstName={user.firstName}
            lastName={user.lastName}
          />
        )
      )}
      <div className="flex-1 text-left">
        <span
          className={cn(
            'text-gray-400 text-sm transition-colors',
            !isDisabled && 'group-hover:text-gray-600',
          )}
        >
          {isWaiting ? "Publication désactivée (liste d'attente)" : 'Écrire un post...'}
        </span>
      </div>
      {isWaiting && (
        <Clock className="w-4 h-4 text-amber-500" />
      )}
    </button>
  );

  // Wrap in tooltip if disabled
  if (isDisabled) {
    return (
      <Tooltip title="Vérifiez votre email pour activer votre compte">
        {button}
      </Tooltip>
    );
  }

  return button;
};

