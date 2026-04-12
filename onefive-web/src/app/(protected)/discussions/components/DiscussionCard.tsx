'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, MessageCircle, Eye, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/base/badges/badges';
import NumberFlow from '@number-flow/react';
import { useFormatter } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tooltip,
  TooltipTrigger
} from '@/components/base/tooltip/tooltip';
import { DiscussionInfer } from '@/queries/discussion';
import { useDiscussionVote } from '@/hooks/useDiscussionVote';
import DiscussionMiniProfile from '@/components/discussions/DiscussionMiniProfile';

import { tags } from '@/constant';
import { defaultProfile } from '@/constant';
import { Tags } from '@/enums';
import { BadgeColors } from '@/components/base/badges/badge-types';

interface DiscussionCardProps {
  discussion: DiscussionInfer;
}

export const DiscussionCard = ({ discussion }: DiscussionCardProps) => {
  const format = useFormatter();
  const timestamp = new Date(discussion.createdAt);
  const now = new Date();
  const relativeTime = format.relativeTime(timestamp, { now });

  let profile = defaultProfile as typeof defaultProfile;
  if (discussion.profile) {
    profile = {
      ...defaultProfile,
      id: discussion.profile.id,
      firstName: discussion.profile.firstName,
      lastName: discussion.profile.lastName,
      createdAt: discussion.profile.createdAt,
      followedBy: discussion.profile.followedBy,
      following: discussion.profile.following ?? 0,
      postsCount: discussion.profile.postsCount ?? 0,
      streak: discussion.profile.streak ?? 0,
      ecosystemRoles: discussion.profile.ecosystemRoles ?? [],
      avatar: discussion.profile.avatar || '',
      bio: discussion.profile.bio || '',
      highlight: discussion.profile.highlight || '',
      isFollowing: discussion.profile.isFollowing ?? false,
      countryCode: discussion.profile.countryCode ?? undefined,
      countryName: undefined,
    };
  }

  const _tagColorMap: Record<Tags, BadgeColors> = {
    [Tags.FUNDAMENTALS]: 'brand',
    [Tags.MARKET]: 'blue',
    [Tags.MARKETING]: 'indigo',
    [Tags.SALES]: 'purple',
    [Tags.SCALING_AND_GROWTH]: 'pink',
    [Tags.FUNDING_AND_INVESTMENT]: 'gray-blue',
    [Tags.LEGAL]: 'orange',
    [Tags.HUMAN_RESOURCES_AND_TEAM]: 'success',
    [Tags.PRODUCT]: 'error',
    [Tags.TECHNOLOGY]: 'warning',
    [Tags.CUSTOMER]: 'gray',
    [Tags.BUILD_IN_PUBLIC]: 'blue',
  };

  const { isUpvoted, upvoteCount, isAnimating, countTrend, handleVote } = useDiscussionVote({
    discussionId: discussion.id,
    initialUpvoted: discussion.hasUpvote,
    initialUpvoteCount: discussion.upvoteCount
  });

  const particleColors = ['#5E6AD2', '#E91E63', '#FF9800', '#FFEB3B', '#4CAF50', '#03A9F4'];

  return (
    <motion.div
      layout="position"
      whileHover={{ y: -2 }}
    >
      <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#5E6AD2]/5 border border-gray-200 hover:border-[#5E6AD2]/20 relative">
        {discussion.context && (
          <div className="absolute top-4 right-4">
            <Tooltip title={`Question à propos de ${discussion.context}`}>
              <TooltipTrigger>
                <Image
                  src={`https://icons.duckduckgo.com/ip3/${discussion.context}.ico`}
                  alt={discussion.context}
                  width={24}
                  height={24}
                  className="rounded-md cursor-help"
                />
              </TooltipTrigger>
            </Tooltip>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote section */}
            <div className="flex flex-col items-center gap-1 min-w-[60px] relative">
              <motion.button
                className={`relative p-2 rounded-lg transition-all duration-200 ${isUpvoted
                    ? 'bg-[#5E6AD2]/10 shadow-lg shadow-[#5E6AD2]/20'
                    : 'hover:bg-gray-50'
                  }`}
                onClick={handleVote}
                whileTap={{ scale: 0.9 }}
                animate={isAnimating ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  x: [0, -6, 6, -4, 4, 0]
                } : {}}
                transition={{
                  duration: 0.4,
                  type: "tween",
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={isAnimating ? {
                    y: [0, -3, 0]
                  } : {}}
                  transition={{ type: "tween", duration: 0.3, delay: 0.1 }}
                >
                  <Triangle
                    className={`w-5 h-5 transition-all duration-300 ${isUpvoted
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
                          type: "tween",
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
                className={`text-sm font-semibold transition-colors duration-300 ${isUpvoted ? 'text-[#5E6AD2]' : 'text-gray-600'
                  }`}
                initial={{ scale: 1 }}
                animate={isAnimating ? {
                  scale: [1, 1.3, 1],
                  y: [0, -2, 0]
                } : {}}
                transition={{
                  duration: 0.3,
                  type: "tween",
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
                className={`text-xs transition-colors duration-300 ${isUpvoted ? 'text-[#5E6AD2]/70' : 'text-gray-400'
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

            {/* Avatar */}
            <div className="flex-shrink-0">
              <DiscussionMiniProfile
                profileId={profile.id}
                firstName={profile.firstName}
                lastName={profile.lastName}
                avatar={profile.avatar}
                highlight={profile.highlight}
                bio={profile.bio}
                countryCode={profile.countryCode}
                countryName={profile.countryName}
                isFollowing={profile.isFollowing}
                ecosystemRoles={profile.ecosystemRoles}
                stats={{
                  followers: profile.followedBy || 0,
                  following: profile.following || 0,
                  posts: profile.postsCount || 0,
                }}
                streak={profile.streak}
                size="md"
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <Link href={`/discussions/${discussion.id}`} className="block">
                <div className="flex flex-col gap-3">
                  {/* Question title */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-[#101828] font-semibold text-lg leading-tight hover:text-[#5E6AD2] transition-colors cursor-pointer pr-8">
                      {discussion.question}
                    </h3>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {discussion.tags.map((tag, index) => {
                      const findTag = tags.find((t) => t.enum === tag);
                      if (findTag)
                        return (
                          <Badge
                            key={index}
                            className={`${findTag.textColor} ${findTag.bgColor} text-xs px-2 py-1 rounded-full border-0 flex items-center gap-1`}
                          >
                            <span>{findTag.icon}</span>
                            {findTag.title}
                          </Badge>
                        );
                    })}
                  </div>

                  {/* Meta information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{discussion.answerCount} réponse{discussion.answerCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{discussion.viewCount} vue{discussion.viewCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{relativeTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 