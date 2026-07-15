"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import FeatureCard from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  MessageCircle,
  Globe,
  Award,
  ThumbsUp,
  Eye,
  Search,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Featured community members


// Featured discussions
const featuredDiscussions = [
  {
    id: 1,
    title: "How did you validate your MVP before raising funds?",
    author: "Sarah Chen",
    category: "Product Development",
    replies: 23,
    likes: 45,
    views: 1200,
    isHot: true,
  },
  {
    id: 2,
    title: "Best practices for B2B SaaS pricing in 2024?",
    author: "Thomas Wright",
    category: "Growth Strategy",
    replies: 18,
    likes: 32,
    views: 890,
    isHot: true,
  },
  {
    id: 3,
    title: "Experiences with seed round fundraising this year?",
    author: "Marie Dubois",
    category: "Fundraising",
    replies: 15,
    likes: 28,
    views: 750,
    isHot: false,
  },
];

// Categories with color coding
const categories = [
  { name: "Growth Strategy", color: "bg-blue-100 text-blue-800" },
  { name: "Fundraising", color: "bg-green-100 text-green-800" },
  { name: "Tech Stack", color: "bg-purple-100 text-purple-800" },
  { name: "Marketing", color: "bg-orange-100 text-orange-800" },
  { name: "Product Development", color: "bg-pink-100 text-pink-800" },
  { name: "Legal & Admin", color: "bg-gray-100 text-gray-800" },
];

// Upcoming community events
const upcomingEvents = [
  {
    title: "Startup Pitch Night",
    date: "June 15, 2024",
    time: "6:00 PM - 8:30 PM",
    location: "Paris Innovation Hub",
    attendees: 120,
  },
  {
    title: "VC Networking Breakfast",
    date: "June 18, 2024",
    time: "8:00 AM - 10:00 AM",
    location: "Le Café Entrepreneur",
    attendees: 45,
  },
  {
    title: "Tech Founders Meetup",
    date: "June 22, 2024",
    time: "7:00 PM - 9:00 PM",
    location: "Onefive HQ",
    attendees: 85,
  },
];

const DiscussionCard = ({
  discussion,
}: {
  discussion: {
    title: string;
    author: string;
    category: string;
    replies: number;
    likes: number;
    views: number;
    isHot: boolean;
  };
}) => (
  <div className="border rounded-lg p-4 hover:border-[#5E6AD2] transition-all hover:shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#5E6AD2] rounded-full flex items-center justify-center text-white text-xs">
            {discussion.author.charAt(0)}
          </div>
          <span className="text-sm text-muted-foreground">
            {discussion.author}
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
          {discussion.replies}
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {discussion.likes}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {discussion.views}
        </div>
      </div>
    </div>
  </div>
);

const EventCard = ({
  event,
}: {
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
  };
}) => (
  <div className="flex flex-col rounded-lg border p-4 hover:border-[#5E6AD2] transition-all hover:shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="w-4 h-4 text-[#5E6AD2]" />
      <span className="text-sm font-medium">{event.date}</span>
      <span className="text-xs text-gray-500">• {event.time}</span>
    </div>
    <h3 className="font-medium mb-1">{event.title}</h3>
    <div className="text-sm text-gray-600 mb-3">{event.location}</div>
    <div className="flex items-center mt-auto text-sm text-gray-500">
      <Users className="w-4 h-4 mr-1" /> {event.attendees} attending
    </div>
  </div>
);

const Body = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto px-4 md:px-8 mt-20">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#8294FF]">
            Connect with Founders Who Understand Your Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join a vibrant community of entrepreneurs, share experiences, and
            grow together in a supportive environment built for startup success.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Join the Community" />
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
        <div className="relative w-full md:w-1/2 h-[400px] rounded-xl overflow-hidden shadow-xl">
          <Image
            src="/mockups/community-dashboard.png"
            alt="Community Dashboard"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      {/* Key Features Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <FeatureCard
            title="Real-Time Interactions"
            subtitle="Get instant feedback from a vibrant network of entrepreneurs."
            description="Engage with posts, leave comments, and spark dynamic discussions with like-minded founders and potential collaborators."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Smart Recommendation Algorithms"
            subtitle="Find the right collaborators and insights effortlessly."
            description="Get tailored suggestions for connections and content based on your profile, interests, industry, and startup stage."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Personalized Feed"
            subtitle="Stay up-to-date with the latest entrepreneurial insights and trends."
            description="A curated newsfeed featuring posts, photos, videos, and valuable resources from founders and experts in your field."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Globe className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Rich Content Sharing"
            subtitle="Showcase your entrepreneurial journey with multimedia posts."
            description="Publish pitch decks, launch videos, product demos, or milestone announcements with maximum visibility to the right audience."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Award className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
        </div>
      </div>

      {/* Featured Discussions Section */}
      <div className="space-y-8">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-3xl font-bold text-center">
            Trending Discussions
          </h2>
        </div>

        <div className="space-y-4">
          {featuredDiscussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Connect with Your Startup Community?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Onefive is where founders, investors and mentors build, grow and scale
          together. Join the waitlist to be part of it.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Join Now" />
          <Link href="/about">
            <Button variant="outline" className="w-full">
              About Onefive
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Community"
        title="Connect. Share. Build."
        description="Onefive's social network designed for entrepreneurs to connect, collaborate, and grow together in a supportive ecosystem."
        image={null}
        displayJoinWaitlist={false}
        body={<Body />}
      />
    </div>
  );
};

export default Community;
