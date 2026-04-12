import React from 'react';
import PostSkeleton from './PostSkeleton';

interface FeedSkeletonProps {
  count?: number;
  className?: string;
}

const FeedSkeleton: React.FC<FeedSkeletonProps> = ({
  count = 3,
  className = ''
}) => {
  // Générer des hauteurs variables pour un effet plus réaliste
  const getRandomHeight = (index: number) => {
    const heights = ['min-h-[200px]', 'min-h-[300px]', 'min-h-[250px]', 'min-h-[350px]'];
    return heights[index % heights.length];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={getRandomHeight(index)}>
          <PostSkeleton />
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
