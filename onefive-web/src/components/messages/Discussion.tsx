import { StaticImageData } from 'next/image';
import { useFormatter } from 'next-intl';
import { motion, HTMLMotionProps } from 'framer-motion';
import DiscussionMiniProfile from '@/components/discussions/DiscussionMiniProfile';

const MotionDiv = (props: HTMLMotionProps<'div'> & { className?: string }) => <motion.div {...props} />;

interface DiscussionProps {
  isOnline: boolean;
  isRead: boolean;
  lastMessage: string;
  timestamp: number;
  firstname: string;
  lastname: string;
  position?: string;
  company?: string;
  highlight?: string;
  avatar: string | StaticImageData;
  unreadCount?: number;
  isTyping?: boolean;
  profileId?: string;
  bio?: string;
  countryCode?: string;
  countryName?: string;
  isFollowing?: boolean;
  stats?: { followers: number; following: number; posts: number };
  streak?: number;
  badges?: { icon: string; label: string }[];
}

const Discussion = ({
  isOnline: _isOnline,
  isRead,
  lastMessage,
  timestamp,
  firstname,
  lastname,
  position,
  company,
  highlight: highlightProp,
  avatar,
  unreadCount = 0,
  isTyping = false,
  profileId,
  bio,
  countryCode,
  countryName,
  isFollowing,
  stats,
  streak,
  badges,
}: DiscussionProps) => {
  const format = useFormatter();
  const dateTime = new Date(timestamp * 1000);
  const now = new Date();
  const relativeTime = format.relativeTime(dateTime, now);

  // Calculer le highlight à partir de position et/ou company, ou utiliser la prop highlight
  const highlight = highlightProp || [position, company].filter(Boolean).join(' @ ') || undefined;

  return (
    <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <DiscussionMiniProfile
          profileId={profileId}
          firstName={firstname}
          lastName={lastname}
          avatar={typeof avatar === 'string' ? avatar : avatar?.src}
          highlight={highlight}
          bio={bio}
          countryCode={countryCode}
          countryName={countryName}
          isFollowing={isFollowing}
          stats={stats}
          streak={streak}
          badges={badges}
          size="md"
        />
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 shrink-0 ml-2">
              {relativeTime}
            </p>
          </div>
          <div className="text-sm text-gray-500 truncate mt-0.5">
            {isTyping ? (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="flex items-center gap-1">
                  <MotionDiv
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <MotionDiv
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  />
                  <MotionDiv
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs font-medium">écrit...</span>
              </div>
            ) : (
              <span>{lastMessage}</span>
            )}
          </div>
        </div>
        {unreadCount > 0 && !isRead && (
          <div className="ml-auto shrink-0">
            <MotionDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="min-w-[18px] h-[18px] bg-blue-500 rounded-full flex items-center justify-center"
            >
              <span className="text-xs font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </MotionDiv>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussion;
