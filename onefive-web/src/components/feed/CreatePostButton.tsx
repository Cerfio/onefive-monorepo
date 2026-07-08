'use client';

import { Avatar } from '@/components/base/avatar/avatar';
import { useMe } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

interface CreatePostButtonProps {
  onClick: () => void;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  onClick,
}) => {
  const { data: user, isLoading } = useMe();

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full bg-white rounded-lg border border-gray-200 p-3',
        'flex items-center gap-3 group',
        'hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer',
      )}
    >
      {isLoading ? (
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
        <span className="text-gray-400 text-sm transition-colors group-hover:text-gray-600">
          Écrire un post...
        </span>
      </div>
    </button>
  );
};

