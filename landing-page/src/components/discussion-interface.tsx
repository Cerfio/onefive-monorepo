"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface DiscussionPost {
  avatar: string;
  username: string;
  timeAgo: string;
  title: string;
  content: string;
  tags: {
    label: string;
    bgColor: string;
    textColor: string;
  }[];
  commentCount: number;
  upvoteCount: number;
  viewCount: number;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
  animate: {
    direction: "up" | "down";
    delay?: number;
    duration?: number;
  };
}

interface TrendingTopic {
  label: string;
  bgColor: string;
  textColor: string;
  growth: string;
}

interface DiscussionInterfaceProps {
  backgroundCircles?: Array<{
    size: number;
    top: string;
    left: string;
    color: string;
  }>;
  discussionPosts?: DiscussionPost[];
  trendingTopics?: TrendingTopic[];
  communityStats?: {
    memberCount: string;
    discussionCount: string;
  };
  activeUserCount?: string;
}

export default function DiscussionInterface({
  backgroundCircles = [
    { size: 380, top: "10%", left: "20%", color: "#7F56D9" },
    { size: 280, top: "60%", left: "70%", color: "#F35C47" },
    { size: 240, top: "80%", left: "10%", color: "#4489B5" },
  ],
  discussionPosts = [
    {
      avatar: "/sally-mason.png",
      username: "Sarah Chen",
      timeAgo: "2h ago",
      title: "How did you validate your MVP?",
      content:
        "Looking for advice on best practices to validate an MVP before full development. What approaches worked for you?",
      tags: [
        {
          label: "Product Development",
          bgColor: "bg-[#F9F5FF]",
          textColor: "text-[#7F56D9]",
        },
        {
          label: "Hot 🔥",
          bgColor: "bg-[#FEF3F2]",
          textColor: "text-[#F04438]",
        },
      ],
      commentCount: 23,
      upvoteCount: 45,
      viewCount: 1200,
      position: { top: "4px", left: "4px" },
      animate: { direction: "up", duration: 4 },
    },
    {
      avatar: "/thomas-wright.png",
      username: "Thomas Wright",
      timeAgo: "4h ago",
      title: "Best practices for B2B SaaS pricing?",
      content:
        "Considering switching from per-user to usage-based pricing. Any insights from founders who've made this transition?",
      tags: [
        {
          label: "Growth Strategy",
          bgColor: "bg-[#EFF8FF]",
          textColor: "text-[#175CD3]",
        },
        {
          label: "Hot 🔥",
          bgColor: "bg-[#FEF3F2]",
          textColor: "text-[#F04438]",
        },
      ],
      commentCount: 18,
      upvoteCount: 32,
      viewCount: 890,
      position: { top: "64px", right: "4px" },
      animate: { direction: "down", duration: 3.5, delay: 0.5 },
    },
  ],
  trendingTopics = [
    {
      label: "Fundraising",
      bgColor: "bg-[#F9F5FF]",
      textColor: "text-[#7F56D9]",
      growth: "+28%",
    },
    {
      label: "AI",
      bgColor: "bg-[#EFF8FF]",
      textColor: "text-[#175CD3]",
      growth: "+42%",
    },
    {
      label: "Product",
      bgColor: "bg-[#FDF2FA]",
      textColor: "text-[#C11574]",
      growth: "+15%",
    },
  ],
  communityStats = {
    memberCount: "2.4K",
    discussionCount: "856",
  },
  activeUserCount = "42",
}: DiscussionInterfaceProps) {
  return (
    <div className="relative p-4 bg-white rounded-xl overflow-hidden">
      {/* Background pattern and gradients - visible on all layouts */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle
              id="pattern-circle"
              cx="10"
              cy="10"
              r="1.6257413380501518"
              fill="#5E6AD2"
            />
          </pattern>
          <rect
            id="rect"
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#pattern-circles)"
          />
        </svg>
      </div>

      {/* Background gradient blobs */}
      {backgroundCircles.map((circle, index) => (
        <div
          key={`discussion-circle-${index}`}
          className="absolute rounded-full -z-10 blur-3xl"
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            background: circle.color,
            opacity: 0.04,
          }}
        />
      ))}

      {/* Desktop/Tablet layout */}
      <div className="hidden sm:block relative h-[450px]">
        {/* Community stats card */}
        <motion.div
          className="absolute bottom-6 left-4 z-20 bg-white rounded-xl shadow-lg border border-gray-100 p-5"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Community Overview
          </h3>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7F56D9] to-[#9E77ED]">
                  {communityStats.memberCount}
                </span>
                <span className="text-xs text-gray-500 mt-1">Members</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7F56D9] to-[#9E77ED]">
                  {communityStats.discussionCount}
                </span>
                <span className="text-xs text-gray-500 mt-1">Discussions</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trending topics */}
        <motion.div
          className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-100 p-5 w-64 z-20"
          animate={{ y: [-3, 3, -3] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🔥</span>
            <span>Trending Topics</span>
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div
                key={`trend-${idx}`}
                className="flex items-center justify-between group"
              >
                <Badge
                  className={`${topic.bgColor} ${topic.textColor} border-0 text-xs py-1 px-2.5 transition-all duration-200 group-hover:shadow-sm`}
                >
                  {topic.label}
                </Badge>
                <span className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  {topic.growth}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Discussion posts in a staggered layout */}
        <div className="grid grid-cols-2 gap-4 pt-24">
          {discussionPosts.map((post, index) => (
            <motion.div
              key={`post-desktop-${index}`}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 hover:border-[#7F56D9]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
              }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <Image
                    src={post.avatar}
                    alt={post.username}
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-white ring-2 ring-[#7F56D9]/10"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      {post.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.timeAgo}
                    </span>
                  </div>
                  <h3 className="font-medium text-[15px] mt-1 text-gray-900">
                    {post.title}
                  </h3>
                </div>
              </div>

              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {post.content}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, tagIdx) => (
                  <Badge
                    key={`tag-${index}-${tagIdx}`}
                    className={`${tag.bgColor} ${tag.textColor} border-0 text-xs px-2.5 py-0.5`}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.18 19.638 8 19C7.5 19 5.5 20 4.5 20C4 20 3.5 19 4 18.5C4.5 18 5 17 5 16.5C3.72 15.042 3 13.574 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z"
                        stroke="#667085"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{post.commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 22V13M2 13L12 2L22 13H2ZM17 22V13"
                        stroke="#667085"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{post.upvoteCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
                      stroke="#667085"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z"
                      stroke="#667085"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{post.viewCount}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile layout - vertical column */}
      <div className="sm:hidden flex flex-col items-center gap-4">
        {/* Trending topics */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          animate={{ y: [-2, 2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🔥</span>
            <span>Trending Topics</span>
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div
                key={`trend-mobile-${idx}`}
                className="flex items-center justify-between group"
              >
                <Badge
                  className={`${topic.bgColor} ${topic.textColor} border-0 text-xs py-1 px-2.5 transition-all duration-200 group-hover:shadow-sm`}
                >
                  {topic.label}
                </Badge>
                <span className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  {topic.growth}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Discussion posts in vertical column */}
        {discussionPosts.map((post, index) => (
          <motion.div
            key={`post-mobile-${index}`}
            className="w-full max-w-xs bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            animate={{ y: [-3, 3] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <Image
                  src={post.avatar}
                  alt={post.username}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-white ring-2 ring-[#7F56D9]/10"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {post.timeAgo}
                  </span>
                </div>
                <h3 className="font-medium text-[15px] mt-1 text-gray-900">
                  {post.title}
                </h3>
              </div>
            </div>

            <p className="mb-3 text-sm text-gray-600 line-clamp-2">
              {post.content}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, tagIdx) => (
                <Badge
                  key={`tag-${index}-${tagIdx}`}
                  className={`${tag.bgColor} ${tag.textColor} border-0 text-xs px-2.5 py-0.5`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.18 19.638 8 19C7.5 19 5.5 20 4.5 20C4 20 3.5 19 4 18.5C4.5 18 5 17 5 16.5C3.72 15.042 3 13.574 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z"
                      stroke="#667085"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{post.commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 22V13M2 13L12 2L22 13H2ZM17 22V13"
                      stroke="#667085"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{post.upvoteCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
                    stroke="#667085"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z"
                    stroke="#667085"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{post.viewCount}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Community stats card */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          animate={{ y: [2, -2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Community Overview
          </h3>
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7F56D9] to-[#9E77ED]">
                  {communityStats.memberCount}
                </span>
                <span className="text-xs text-gray-500 mt-1">Members</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7F56D9] to-[#9E77ED]">
                  {communityStats.discussionCount}
                </span>
                <span className="text-xs text-gray-500 mt-1">Discussions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
