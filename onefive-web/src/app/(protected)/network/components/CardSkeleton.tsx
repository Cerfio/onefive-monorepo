import React from 'react';

const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center animate-pulse">
        <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200 mb-2"></div>
        <div className="h-3 w-1/2 rounded bg-gray-200 mb-4"></div>
        <div className="flex gap-2 mb-4">
            <div className="h-5 w-12 rounded-full bg-gray-200"></div>
            <div className="h-5 w-16 rounded-full bg-gray-200"></div>
        </div>
        <div className="flex-1"></div>
        <div className="h-4 w-1/3 rounded bg-gray-200 mb-3"></div>
        <div className="flex gap-2 w-full">
            <div className="h-8 w-full rounded-lg bg-gray-200"></div>
            <div className="h-8 w-full rounded-lg bg-gray-200"></div>
        </div>
    </div>
);

export default CardSkeleton; 