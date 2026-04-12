"use client";
import React from "react";
import Builder from "@/components/builder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, MessageCircle, ThumbsUp, Eye } from "lucide-react";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

const categories = [
  { name: "Growth Strategy", color: "bg-blue-100 text-blue-800" },
  { name: "Fundraising", color: "bg-green-100 text-green-800" },
  { name: "Tech Stack", color: "bg-purple-100 text-purple-800" },
  { name: "Marketing", color: "bg-orange-100 text-orange-800" },
  { name: "Product Development", color: "bg-pink-100 text-pink-800" },
  { name: "Legal & Admin", color: "bg-gray-100 text-gray-800" },
];

const discussions = [
  {
    id: 1,
    title: "How did you validate your MVP?",
    author: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
    },
    category: "Product Development",
    stats: {
      replies: 23,
      likes: 45,
      views: 1200,
    },
    isHot: true,
    lastActivity: "2h ago",
  },
  {
    id: 2,
    title: "Best practices for B2B SaaS pricing?",
    author: {
      name: "Thomas Wright",
      avatar: "/avatars/thomas.jpg",
    },
    category: "Growth Strategy",
    stats: {
      replies: 18,
      likes: 32,
      views: 890,
    },
    isHot: true,
    lastActivity: "4h ago",
  },
  {
    id: 3,
    title: "Experiences with seed round in 2024?",
    author: {
      name: "Marie Dubois",
      avatar: "/avatars/marie.jpg",
    },
    category: "Fundraising",
    stats: {
      replies: 15,
      likes: 28,
      views: 750,
    },
    isHot: false,
    lastActivity: "1d ago",
  },
  // Add more discussions as needed
];

const TopContributors = [
  {
    name: "Alex Rivera",
    avatar: "/avatars/alex.jpg",
    contributions: 156,
    expertise: "Growth Strategy",
  },
  {
    name: "Emma Watson",
    avatar: "/avatars/emma.jpg",
    contributions: 142,
    expertise: "Product Development",
  },
  {
    name: "Liu Wei",
    avatar: "/avatars/liu.jpg",
    contributions: 128,
    expertise: "Tech Stack",
  },
];

const communityStats = [
  {
    value: "Coming soon",
    label: "Active Members",
    description: "Entrepreneurs and founders",
  },
  {
    value: "Coming soon",
    label: "Daily Discussions",
    description: "Active conversations",
  },
  {
    value: "Coming soon",
    label: "Knowledge Shared",
    description: "Comments and insights",
  },
  {
    value: "Coming soon",
    label: "Help Rate",
    description: "Questions resolved",
  },
  {
    value: "Coming soon",
    label: "Countries",
    description: "Global community",
  },
  {
    value: "Coming soon",
    label: "Community Support",
    description: "Always available",
  },
];

const features = [
  {
    title: "Peer-to-Peer Support",
    description:
      "Connect with experienced entrepreneurs who've faced similar challenges",
    icon: "🤝",
  },
  {
    title: "Industry Insights",
    description:
      "Access real-world experiences and best practices from successful founders",
    icon: "💡",
  },
  {
    title: "Global Network",
    description: "Join a worldwide community of innovative entrepreneurs",
    icon: "🌍",
  },
  {
    title: "Real-time Discussions",
    description: "Get quick answers to your pressing business questions",
    icon: "⚡",
  },
];

const DiscussionCard = ({
  discussion,
}: {
  discussion: (typeof discussions)[0];
}) => (
  <div className="border rounded-lg p-4 hover:border-[#5E6AD2] transition-all hover:shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={discussion.author.avatar}
            alt={discussion.author.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            {discussion.author.name}
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {discussion.lastActivity}
          </span>
        </div>
        <h3 className="font-medium mb-2 hover:text-[#5E6AD2] cursor-pointer">
          {discussion.title}
        </h3>
        <div className="flex items-center gap-4">
          <Badge
            className={`${
              categories.find((c) => c.name === discussion.category)?.color
            }`}
          >
            {discussion.category}
          </Badge>
          {discussion.isHot && (
            <Badge className="bg-red-100 text-red-800">Hot 🔥</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {discussion.stats.replies}
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {discussion.stats.likes}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {discussion.stats.views}
        </div>
      </div>
    </div>
  </div>
);

const Body = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Community Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16 mt-10">
        {communityStats.map((stat, index) => (
          <div
            key={index}
            className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all text-center"
          >
            <div className="text-3xl font-bold text-[#5E6AD2] mb-2">
              {stat.value}
            </div>
            <div className="font-medium mb-1">{stat.label}</div>
            <div className="text-sm text-muted-foreground">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-[#F9FAFB] rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Thriving Community</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with fellow entrepreneurs, share experiences, and grow
          together. Get access to exclusive discussions, networking
          opportunities, and more.
        </p>
        <div className="flex justify-center gap-4">
          <ButtonJoinWaitlist text="Join the Community" />
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </div>
  );
};

const CommunitySupport = () => {
  return (
    <Builder
      title="Community Forum"
      description="Join a global network of entrepreneurs and innovators"
      image={null}
      displayJoinWaitlist={false}
      body={<Body />}
      badge="Community"
    />
  );
};

export default CommunitySupport;
