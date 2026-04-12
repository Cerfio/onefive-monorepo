'use client';

import React, { useCallback } from 'react';
import { Post, PostSkeleton } from '@/features/post/components/post';
import { useFeedFilter } from '@/contexts/FeedFilterContext';
import { Tags } from '@/enums';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import CommentSkeleton from '@/features/post/components/comment/CommentSkeleton';

export function PostFullView({ postId }: { postId: string }) {
  const { addTag } = useFeedFilter();
  const router = useRouter();

  const handleTagClick = useCallback(
    (tag: Tags) => {
      addTag(tag);
      router.push('/feed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [addTag, router],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!postId) {
    return (
      <div className="min-h-screen bg-[#FCFCFD]">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4 w-full border-l border-r">
            <PostSkeleton />
            <div className="flex flex-col gap-2 mx-5">
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Button
            color="secondary"
            size="sm"
            onClick={handleBack}
            iconLeading={<ArrowLeft data-icon />}
          >
            Retour au feed
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Post postId={postId} showComments onTagClick={handleTagClick} />
        </motion.div>
      </div>
    </div>
  );
}
