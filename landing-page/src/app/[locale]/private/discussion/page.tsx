"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  ThumbsUp,
  Eye,
  BarChart2,
  PieChart,
  Users,
  Award,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextArea } from "@/components/ui/text-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const DiscussionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [postType, setPostType] = useState<"question" | "poll">("question");

  const categories = [
    {
      id: "growth",
      name: "Growth Strategy",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "fundraising",
      name: "Fundraising",
      color: "bg-green-100 text-green-700",
    },
    { id: "tech", name: "Tech Stack", color: "bg-violet-100 text-violet-700" },
    {
      id: "marketing",
      name: "Marketing",
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: "product",
      name: "Product Development",
      color: "bg-pink-100 text-pink-700",
    },
    { id: "legal", name: "Legal & Admin", color: "bg-gray-100 text-gray-700" },
  ];

  const communityStats = [
    { label: "Members", value: "2.4K", color: "text-[#5E6AD2]" },
    { label: "Discussions", value: "856", color: "text-[#5E6AD2]" },
    { label: "Comments", value: "12.5K", color: "text-[#5E6AD2]" },
    { label: "Help Rate", value: "98%", color: "text-[#5E6AD2]" },
  ];

  const topContributors = [
    {
      name: "Alex Rivera",
      avatar: "/isobel-fuller.jpg",
      category: "Growth Strategy",
      points: 156,
    },
    {
      name: "Emma Watson",
      avatar: "/franklin-mays.jpg",
      category: "Product Development",
      points: 142,
    },
    {
      name: "Liu Wei",
      avatar: "/speakers/sarah.jpg",
      category: "Tech Stack",
      points: 129,
    },
  ];

  const discussions = [
    {
      id: "disc1",
      author: {
        name: "Sarah Chen",
        avatar: "/speakers/sarah.jpg",
      },
      timeAgo: "2h ago",
      title: "How did you validate your MVP?",
      categories: ["Product Development"],
      isHot: true,
      comments: 23,
      likes: 45,
      views: 1200,
    },
    {
      id: "disc2",
      author: {
        name: "Thomas Wright",
        avatar: "/franklin-mays.jpg",
      },
      timeAgo: "4h ago",
      title: "Best practices for B2B SaaS pricing?",
      categories: ["Growth Strategy"],
      isHot: true,
      comments: 18,
      likes: 32,
      views: 890,
    },
    {
      id: "disc3",
      author: {
        name: "Marie Dubois",
        avatar: "/isobel-fuller.jpg",
      },
      timeAgo: "1d ago",
      title: "Experiences with seed round in 2024?",
      categories: ["Fundraising"],
      isHot: false,
      comments: 15,
      likes: 28,
      views: 750,
    },
    {
      id: "disc4",
      author: {
        name: "Carlos Rodriguez",
        avatar: "/franklin-mays.jpg",
      },
      timeAgo: "2d ago",
      title: "Tools for remote team management?",
      categories: ["Tech Stack"],
      isHot: false,
      comments: 27,
      likes: 36,
      views: 980,
    },
    {
      id: "disc5",
      author: {
        name: "Yuki Tanaka",
        avatar: "/speakers/sarah.jpg",
      },
      timeAgo: "3d ago",
      title: "Tips for first-time founders seeking angel investment",
      categories: ["Fundraising"],
      isHot: true,
      comments: 42,
      likes: 67,
      views: 1350,
    },
  ];

  // Filter discussions based on selected category and search query
  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesCategory =
      selectedCategory === "all" ||
      discussion.categories.some((cat) => {
        const category = categories.find((c) => c.name === cat);
        return category && category.id === selectedCategory;
      });

    const matchesSearch =
      searchQuery === "" ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  className="pl-10 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="px-4 bg-[#5E6AD2] hover:bg-[#4F58B8] text-white">
                    Start Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Discussion</DialogTitle>
                    <DialogDescription>
                      Share your question or start a poll to gather insights
                      from the community.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <div className="mb-6">
                      <RadioGroup
                        defaultValue="question"
                        className="flex gap-4"
                        onValueChange={(value) =>
                          setPostType(value as "question" | "poll")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="question" id="question" />
                          <Label htmlFor="question">Text Question</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="poll" id="poll" />
                          <Label htmlFor="poll">Poll</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="What's your question?" />
                      </div>

                      {postType === "question" ? (
                        <div>
                          <Label htmlFor="details">Details (optional)</Label>
                          <TextArea
                            id="details"
                            placeholder="Add more context to your question..."
                            className="min-h-[100px]"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label>Poll Options</Label>
                          {[1, 2].map((option) => (
                            <Input
                              key={option}
                              placeholder={`Option ${option}`}
                            />
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Option
                          </Button>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          className="w-full p-2 border rounded-md"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Post Discussion
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className={selectedCategory === "all" ? "bg-[#5E6AD2]" : ""}
                onClick={() => setSelectedCategory("all")}
              >
                All Topics
              </Button>

              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  className={
                    selectedCategory === category.id ? "bg-[#5E6AD2]" : ""
                  }
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#5E6AD2] transition-colors"
                >
                  <div className="flex gap-3 mb-3">
                    <Image
                      src={discussion.author.avatar}
                      alt={discussion.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">
                        {discussion.author.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {discussion.timeAgo}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-3">
                    <Link
                      href={`/private/discussion/${discussion.id}`}
                      className="hover:text-[#5E6AD2]"
                    >
                      {discussion.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {discussion.categories.map((categoryName) => {
                      const category = categories.find(
                        (cat) => cat.name === categoryName
                      );
                      return (
                        <Badge
                          key={categoryName}
                          className={`font-normal px-2.5 py-1 ${category?.color || "bg-gray-100 text-gray-700"}`}
                        >
                          {categoryName}
                        </Badge>
                      );
                    })}

                    {discussion.isHot && (
                      <Badge className="bg-red-100 text-red-700 font-normal px-2.5 py-1">
                        Hot 🔥
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      {discussion.comments}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="h-4 w-4" />
                      {discussion.likes}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {discussion.views}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Community Stats</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {communityStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Top Contributors</h3>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={contributor.avatar}
                          alt={contributor.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {contributor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {contributor.category}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-gray-100 font-medium"
                      >
                        {contributor.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Trending Topics</h3>
              </div>

              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2 items-center text-[#5E6AD2]">
                    {/* <Fire className="h-4 w-4 text-orange-500" /> */}
                    <span>Fundraising in a downturn</span>
                  </li>
                  <li className="flex gap-2 items-center text-[#5E6AD2]">
                    {/* <Fire className="h-4 w-4 text-orange-500" /> */}
                    <span>AI implementation for startups</span>
                  </li>
                  <li className="flex gap-2 items-center text-[#5E6AD2]">
                    {/* <Fire className="h-4 w-4 text-orange-500" /> */}
                    <span>Product market fit indicators</span>
                  </li>
                  <li className="flex gap-2 items-center text-[#5E6AD2]">
                    {/* <Fire className="h-4 w-4 text-orange-500" /> */}
                    <span>Scaling sales teams efficiently</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscussionPage;
