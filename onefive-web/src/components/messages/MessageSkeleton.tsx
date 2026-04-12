import { motion } from 'framer-motion';

const MessageSkeleton = () => {
  return (
    <div className="flex gap-3 w-full animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
      
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-2 max-w-[588px]">
          {/* Name skeleton */}
          <div className="flex justify-between gap-4 items-center">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          
          {/* Message skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscussionSkeleton = () => {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="flex items-center gap-3 max-w-[80%]">
          <div className="w-2 h-2 bg-gray-200 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex flex-col max-w-[75%]">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="mt-4 space-y-1">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
};

const MessagesListSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MessageSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

const DiscussionsListSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <DiscussionSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

export { MessageSkeleton, DiscussionSkeleton, MessagesListSkeleton, DiscussionsListSkeleton }; 