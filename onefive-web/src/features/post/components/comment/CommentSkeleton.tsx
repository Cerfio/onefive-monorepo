import { Skeleton } from '@/components/ui';
import { memo } from 'react';

const CommentSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <div className="space-y-2 mt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex gap-2 mt-1 ml-1">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
};

export default memo(CommentSkeleton);
