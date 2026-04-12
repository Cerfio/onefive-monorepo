import { motion, AnimatePresence } from 'framer-motion';
import { Triangle } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { useDiscussionVote } from '@/hooks/useDiscussionVote';

interface VoteSectionProps {
  discussionId: string;
  initialUpvoted: boolean;
  initialUpvoteCount: number;
}

const VoteSection = ({ discussionId, initialUpvoted, initialUpvoteCount }: VoteSectionProps) => {
  const { isUpvoted, upvoteCount, isAnimating, countTrend, handleVote } = useDiscussionVote({
    discussionId,
    initialUpvoted,
    initialUpvoteCount
  });

  // Couleurs de particules pour l'animation
  const particleColors = ['#5E6AD2', '#E91E63', '#FF9800', '#FFEB3B', '#4CAF50', '#03A9F4'];

  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px] relative">
      <motion.button 
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isUpvoted 
            ? 'bg-[#5E6AD2]/10 shadow-lg shadow-[#5E6AD2]/20' 
            : 'hover:bg-gray-50'
        }`}
        onClick={handleVote}
        whileTap={{ scale: 0.9 }}
        animate={isAnimating ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ 
          type: "tween",
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={isAnimating ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ type: "tween", duration: 0.3, delay: 0.1 }}
        >
          <Triangle 
            className={`w-8 h-8 transition-all duration-300 ${
              isUpvoted 
                ? 'stroke-[#5E6AD2] fill-[#5E6AD2] drop-shadow-sm' 
                : 'stroke-gray-400 hover:stroke-[#5E6AD2] fill-transparent hover:fill-[#5E6AD2]/20'
            }`} 
          />
        </motion.div>
        
        {/* Burst particles animation */}
        <AnimatePresence>
          {isAnimating && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: Math.cos((i * 60) * Math.PI / 180) * 20,
                    y: Math.sin((i * 60) * Math.PI / 180) * 20,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    type: "tween",
                    duration: 0.3,
                    delay: 0,
                    ease: "easeOut"
                  }}
                  style={{
                    backgroundColor: particleColors[i % particleColors.length],
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              
              {/* Ring expansion effect */}
              <motion.div
                className="absolute border-2 border-[#5E6AD2]/30 rounded-full"
                initial={{ 
                  width: 0, 
                  height: 0,
                  opacity: 0.7
                }}
                animate={{ 
                  width: 40, 
                  height: 40,
                  opacity: 0
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Animated count with casino effect */}
      <motion.div 
        className={`text-sm font-semibold transition-colors duration-300 ${
          isUpvoted ? 'text-[#5E6AD2]' : 'text-gray-600'
        }`}
        initial={{ scale: 1 }}
        animate={isAnimating ? { 
          scale: [1, 1.3, 1],
          y: [0, -2, 0]
        } : {}}
        transition={{ 
          type: "tween",
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <NumberFlow
          value={upvoteCount}
          format={{ notation: 'compact' }}
          transformTiming={{
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          trend={countTrend}
          spinTiming={{
            duration: 600,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
          willChange
        />
      </motion.div>
      
      <motion.span 
        className={`text-xs transition-colors duration-300 ${
          isUpvoted ? 'text-[#5E6AD2]/70' : 'text-gray-400'
        }`}
        animate={isAnimating ? { 
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          type: "tween",
          duration: 0.4,
          delay: 0.1
        }}
      >
        vote{upvoteCount > 1 ? 's' : ''}
      </motion.span>
    </div>
  );
};

export default VoteSection; 