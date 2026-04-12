"use client";
import React from "react";
import Builder from "@/components/builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  DollarSign,
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Get paid for every article you write. Rates based on experience and quality."
  },
  {
    icon: Users,
    title: "Build Your Audience",
    description: "Reach thousands of startup founders and tech professionals."
  },
  {
    icon: Sparkles,
    title: "Personal Branding",
    description: "Establish yourself as a thought leader in the startup ecosystem."
  },
  {
    icon: BookOpen,
    title: "Editorial Support",
    description: "Work with our experienced editors to refine your content."
  },
  {
    icon: Target,
    title: "Topic Freedom",
    description: "Write about your areas of expertise and passion within tech."
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Opportunities for increased involvement and leadership roles."
  },
];

const topics = [
  "Startup Strategy",
  "Growth Marketing",
  "Product Development",
  "Fundraising",
  "Team Building",
  "Tech Innovation",
  "Market Analysis",
  "User Experience",
];

const Body = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Become a Content Writer at Onefive
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Share your expertise, build your personal brand, and help shape the future of startups.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#5E6AD2]" />
            <span>150+ Published Articles</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#5E6AD2]" />
            <span>10k+ Monthly Readers</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#5E6AD2]" />
            <span>Flexible Schedule</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
        <div className="space-y-12">
          {/* Benefits Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Why Write for Us?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border hover:border-[#5E6AD2] transition-all"
                >
                  <div className="p-2 bg-[#5E6AD2]/10 rounded-lg w-fit mb-4">
                    <benefit.icon className="w-5 h-5 text-[#5E6AD2]" />
                  </div>
                  <h3 className="font-medium mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Topics Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">What You Can Write About</h2>
            <div className="bg-white rounded-xl border p-6">
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Badge 
                    key={topic}
                    variant="outline"
                    className="px-3 py-1.5"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                And many more topics related to startups, technology, and business growth.
              </p>
            </div>
          </section>

          {/* Process Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Apply",
                  description: "Fill out our writer application form with your experience and writing samples."
                },
                {
                  step: "2",
                  title: "Get Approved",
                  description: "Our editorial team reviews your application and writing style."
                },
                {
                  step: "3",
                  title: "Start Writing",
                  description: "Choose topics from our content calendar or pitch your own ideas."
                },
                {
                  step: "4",
                  title: "Publish & Earn",
                  description: "Work with our editors to refine your content and get published."
                }
              ].map((item) => (
                <div 
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#5E6AD2]/10 flex items-center justify-center text-[#5E6AD2] font-medium flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join Waitlist Card */}
          <div className="bg-[#5E6AD2]/5 rounded-xl p-6 border border-[#5E6AD2]/20 sticky top-6">
            <h3 className="font-semibold mb-4">Join the Waitlist</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We're currently building our content writer program. Be the first to know when we launch!
            </p>
            <Button 
              className="w-full bg-[#5E6AD2] hover:bg-[#4F58B0]"
              disabled
            >
              Coming Soon
            </Button>
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Join 50+ writers already on the waitlist</span>
              </div>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold mb-4">Requirements</h3>
            <ul className="space-y-3">
              {[
                "Proven writing experience",
                "Deep knowledge in your area of expertise",
                "Strong English writing skills",
                "Ability to meet deadlines",
                "Passion for startups and technology"
              ].map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#5E6AD2] mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const BecomeWriterPage = () => {
  return (
    <Builder
      title={null}
      description={null}
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Blog"
    />
  );
};

export default BecomeWriterPage; 