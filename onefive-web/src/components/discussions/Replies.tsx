import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle } from 'lucide-react';
import RichCommentInput from '@/components/discussions/RichCommentInput';
import DiscussionMiniProfile from '@/components/discussions/DiscussionMiniProfile';
import { DiscussionAnswerInfer } from '@/queries/discussion';
import { useFormatter } from 'next-intl';
import Link from 'next/link';
import { ReportModal } from '@/components/modals/ReportModal';

const Replies = ({ answer }: { answer: DiscussionAnswerInfer }) => {
  const [showReply, setShowReply] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(answer.hasUpvote);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [_countTrend, setCountTrend] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [replyComment, setReplyComment] = useState('');

  const format = useFormatter();
  const timestamp = new Date(answer.createdAt);
  const now = new Date();
  const relativeTime = format.relativeTime(timestamp, { now });

  const particleColors = ['#5E6AD2', '#E91E63', '#FF9800', '#FFEB3B', '#4CAF50', '#03A9F4'];

  const handleUpvote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsUpvoted(!isUpvoted);
    setTimeout(() => {
      const newTrend = isUpvoted ? -1 : 1;
      setCountTrend(newTrend);
      setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
    }, 100);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="flex gap-3">
      <DiscussionMiniProfile
        profileId={answer.profile?.id}
        firstName={answer.profile?.firstName}
        lastName={answer.profile?.lastName}
        avatar={answer.profile?.avatar || ''}
        highlight={answer.profile?.highlight}
        bio={answer.profile?.bio}
        isFollowing={answer.profile?.isFollowing}
        countryCode={answer.profile?.countryCode ?? undefined}
        ecosystemRoles={answer.profile?.ecosystemRoles}
        streak={answer.profile?.streak}
        stats={{ followers: answer.profile?.followedBy ?? 0, following: answer.profile?.following ?? 0, posts: answer.profile?.postsCount ?? 0 }}
        size="md"
      />
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col">
          <Link 
            href={`/profile/${answer.profile?.id}`} 
            className="font-medium text-sm hover:underline text-gray-900"
          >
            {answer.profile
              ? `${answer.profile.firstName} ${answer.profile.lastName}`
              : 'Utilisateur'}
          </Link>
          <p className="text-xs text-muted-foreground">
            {answer.profile?.highlight || ''}
          </p>
          <span className="text-xs text-gray-500">
            {relativeTime}
          </span>
        </div>
        <div className="text-gray-700 text-sm">{answer.content}</div>
        <div className="flex gap-8 font-medium text-gray-700 text-xs">
          {/* Vote animé pour les réponses */}
          <motion.div 
            className={`cursor-pointer hover:text-primary-700 transition-colors flex items-center gap-2 ${
              isUpvoted ? 'text-[#5E6AD2]' : 'text-gray-700'
            }`}
            onClick={handleUpvote}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isAnimating ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ 
                type: "tween",
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <Triangle 
                className={`w-3 h-3 transition-all duration-200 ${
                  isUpvoted 
                    ? 'stroke-[#5E6AD2] fill-[#5E6AD2]' 
                    : 'stroke-gray-400 fill-transparent'
                }`} 
              />
              {/* Mini particles for replies */}
              <AnimatePresence>
                {isAnimating && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full"
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{ 
                          x: Math.cos((i * 90) * Math.PI / 180) * 8,
                          y: Math.sin((i * 90) * Math.PI / 180) * 8,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                          backgroundColor: particleColors[i % particleColors.length],
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.span
              animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {upvoteCount}
            </motion.span>
          </motion.div>
          <div className="cursor-pointer" onClick={() => setShowReply(true)}>
            Reply
          </div>
          <div>Share</div>
          <div className="cursor-pointer" onClick={() => setIsReportOpen(true)}>Report</div>
        </div>
        {showReply && (
          <RichCommentInput
            replyTo={answer.profile ? `${answer.profile.firstName} ${answer.profile.lastName}` : ''}
            comment={replyComment}
            setComment={setReplyComment}
            callback={() => {
              setShowReply(false);
              setReplyComment('');
            }}
            cancelCallback={() => setShowReply(false)}
          />
        )}
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        resourceType="DISCUSSION_ANSWER"
        resourceId={answer.id}
      />
    </div>
  );
};

export default Replies; 