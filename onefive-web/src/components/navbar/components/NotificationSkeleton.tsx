import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-4">
      {/* Skeleton pour les onglets */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-lg flex-1 animate-pulse" />
        ))}
      </div>
      
      {/* Skeleton pour les notifications */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          {/* Avatar skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse shrink-0" />
          
          {/* Contenu skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
          
          {/* Indicateur skeleton */}
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse shrink-0 mt-2" />
        </div>
      ))}
    </div>
  );
};

export const UserDropdownSkeleton: React.FC = () => {
  return (
    <div className="w-64 p-3">
      {/* Header skeleton */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-8" />
      </div>
      
      {/* Menu items skeleton */}
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}; 