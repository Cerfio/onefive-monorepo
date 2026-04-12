"use client";
import React from "react";
import Builder from "@/components/builder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon } from "lucide-react";

const HelpCategories = [
  {
    title: "Getting Started",
    icon: "🚀",
    description: "Everything you need to know to get started with Onefive",
    articles: [
      "Creating your account",
      "Setting up your profile",
      "Understanding the dashboard",
      "First steps on Onefive",
    ],
  },
  {
    title: "Account & Settings",
    icon: "⚙️",
    description: "Manage your account settings and preferences",
    articles: [
      "Account security",
      "Privacy settings",
      "Notification preferences",
      "Profile customization",
    ],
  },
  {
    title: "Network Features",
    icon: "🤝",
    description: "Learn how to connect and interact with other entrepreneurs",
    articles: [
      "Finding connections",
      "Messaging system",
      "Groups and communities",
      "Network building tips",
    ],
  },
  {
    title: "Resources & Tools",
    icon: "📚",
    description: "Make the most of Onefive's entrepreneurial resources",
    articles: [
      "Accessing templates",
      "Using the methodology section",
      "Finding investors",
      "Event participation",
    ],
  },
];

const PopularArticles = [
  {
    title: "How to optimize your startup profile",
    category: "Getting Started",
    readTime: "5 min read",
  },
  {
    title: "Best practices for networking on Onefive",
    category: "Network Features",
    readTime: "8 min read",
  },
  {
    title: "Understanding the investment process",
    category: "Resources & Tools",
    readTime: "10 min read",
  },
  {
    title: "Security best practices for your account",
    category: "Account & Settings",
    readTime: "6 min read",
  },
];

const CategoryCard = ({
  title,
  icon,
  description,
  articles,
}: {
  title: string;
  icon: string;
  description: string;
  articles: string[];
}) => (
  <div className="border border-gray-200 rounded-lg p-6 hover:border-[#5E6AD2] transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-muted-foreground mb-4">{description}</p>
    <ul className="space-y-2">
      {articles.map((article, index) => (
        <li
          key={index}
          className="text-sm text-[#5E6AD2] hover:underline cursor-pointer"
        >
          {article}
        </li>
      ))}
    </ul>
  </div>
);

const ArticleCard = ({
  title,
  category,
  readTime,
}: {
  title: string;
  category: string;
  readTime: string;
}) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#5E6AD2] transition-colors cursor-pointer">
    <Badge variant="secondary" className="mb-2">
      {category}
    </Badge>
    <h3 className="font-medium mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{readTime}</p>
  </div>
);

const Body = () => {
  return (
    <div className="max-w-7xl mx-auto px-8">
      {/* Search Section */}
      <div className="mt-10 flex flex-col items-center mb-16">
        <div className="relative w-full max-w-2xl">
          <Input
            placeholder="Search for help articles..."
            className="pl-10 py-6 text-lg"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HelpCategories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
      </div>

      {/* Popular Articles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PopularArticles.map((article, index) => (
            <ArticleCard key={index} {...article} />
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-muted-foreground mb-6">
          Our support team is here to help you with any questions or issues you
          may have.
        </p>
        <Button className="bg-[#5E6AD2]">Contact Support</Button>
      </div>
    </div>
  );
};

const HelpCenter = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        title="How can we help you?"
        description="Search our knowledge base or browse through our help articles"
        image={null}
        body={<Body />}
        displayJoinWaitlist={false}
        badge="Help Center"
      />
    </div>
  );
};

export default HelpCenter;
