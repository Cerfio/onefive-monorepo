import React from 'react';

const CreatePostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      {/* Header avec avatar et nom */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="mb-4">
        <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
        </div>

        {/* Médias */}
        <div className="flex gap-2 mb-3">
          <div className="w-20 h-16 bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-16 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostSkeleton;
