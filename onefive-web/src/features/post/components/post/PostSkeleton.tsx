import { cn } from '@/lib/utils';
import { memo } from 'react';

const PostSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse',
        className,
      )}
    >
      {/* Post Author Section */}
      <div className="p-2 px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-8 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-5 w-5 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {/* Text content */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* Image placeholder */}
        {/* <div className="rounded-lg overflow-hidden">
          <div className="w-full h-64 bg-gray-200" />
        </div> */}
      </div>

      {/* Post Interactions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white" />
              <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white" />
            </div>
            <div className="h-3 w-8 bg-gray-200 rounded ml-2" />
          </div>
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-gray-100 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center py-1"
            >
              <div className="h-4 w-4 bg-gray-200 rounded mr-2" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PostSkeleton);
