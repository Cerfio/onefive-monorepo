'use client';

import { motion } from 'framer-motion';
import { Triangle } from 'lucide-react';

const ShimmerBar = ({ className }: { className?: string }) => {
  return <div className={`${className} bg-gray-200 rounded-full animate-pulse`} />;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const DiscussionShimmer = () => {
  return (
    <motion.div 
      variants={cardVariants}
      className="flex gap-7"
    >
      <div className="w-11 h-11 rounded-full relative">
        <div className="flex items-center">
          <svg
            className="w-11 h-11 text-gray-200 animate-pulse"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <Triangle className="w-5 h-5 stroke-gray-200 fill-gray-200 animate-pulse" />
        <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-[24px] items-start">
          <ShimmerBar className="h-2.5 w-80" />
          <div className="flex gap-3">
            <ShimmerBar className="h-4 w-12" />
            <ShimmerBar className="h-4 w-12" />
          </div>
        </div>
        <div className="flex gap-6">
          <ShimmerBar className="h-2 w-24" />
          <ShimmerBar className="h-2 w-14" />
          <ShimmerBar className="h-2 w-10" />
          <ShimmerBar className="h-2 w-14" />
        </div>
      </div>
    </motion.div>
  );
}; 