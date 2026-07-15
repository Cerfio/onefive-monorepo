"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Star,
  TrendingUp,
  Lightbulb,
  Users,
  CheckCircle,
  Bell,
  Clock,
  Calendar,
} from "lucide-react";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const NewsletterPage = () => {
  const { formattedCount } = useWaitlistCount();
  const features = [
    {
      icon: Star,
      title: "Curated Content",
      description:
        "Hand-picked insights from top entrepreneurs and industry experts",
    },
    {
      icon: TrendingUp,
      title: "Market Trends",
      description:
        "Stay ahead with the latest startup and tech industry trends",
    },
    {
      icon: Lightbulb,
      title: "Actionable Insights",
      description:
        "Practical tips and strategies you can implement immediately",
    },
  ];

  const testimonials = [
    {
      avatar: "/testimonials/founder1.jpg",
      name: "Sarah Chen",
      role: "Founder, TechStart",
      quote:
        "The best newsletter for staying updated on the European startup ecosystem.",
    },
    // ... autres témoignages
  ];

  const recentIssues = [
    {
      title: "AI Revolution in European Startups",
      date: "Mar 15, 2024",
      readTime: "5 min",
      preview: "Exploring how European startups are leveraging AI...",
      category: "Tech Trends",
    },
    // ... autres numéros
  ];

  return (
    <>
      <NavigationMenuDemo />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4">{formattedCount ?? "..."}+ Subscribers</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Your Weekly Dose of Startup Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of founders and innovators getting the latest
            insights on entrepreneurship, technology, and innovation.
          </p>

          {/* Subscribe Form */}
          <div className="max-w-md mx-auto">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 py-6 text-lg"
                />
              </div>
              <Button className="w-full bg-[#5E6AD2] py-6 text-lg">
                Subscribe Now
              </Button>
              <p className="text-sm text-muted-foreground">
                Join {formattedCount ?? "..."}+ subscribers. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#5E6AD2]/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-[#5E6AD2]" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Issues Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Recent Issues</h2>
          <div className="grid grid-cols-2 gap-6">
            {recentIssues.map((issue) => (
              <div
                key={issue.title}
                className="p-6 rounded-xl border hover:border-[#5E6AD2] transition-all"
              >
                <Badge variant="outline" className="mb-4">
                  {issue.category}
                </Badge>
                <h3 className="text-xl font-semibold mb-3">{issue.title}</h3>
                <p className="text-muted-foreground mb-4">{issue.preview}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {issue.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {issue.readTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You'll Get */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">What You'll Get</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#5E6AD2] mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Weekly Insights</h3>
                  <p className="text-muted-foreground text-sm">
                    Curated analysis of the latest trends and opportunities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#5E6AD2] mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Exclusive Interviews</h3>
                  <p className="text-muted-foreground text-sm">
                    Deep dives with successful founders and investors
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#5E6AD2] mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Market Reports</h3>
                  <p className="text-muted-foreground text-sm">
                    Data-driven analysis of emerging opportunities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#5E6AD2] mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Resource Library</h3>
                  <p className="text-muted-foreground text-sm">
                    Tools, templates, and guides for founders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">What Subscribers Say</h2>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-[#5E6AD2]/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Stay Ahead of the Curve</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get weekly insights delivered straight to your inbox. Join our
            community of forward-thinking founders and innovators.
          </p>
          <Button className="bg-[#5E6AD2]">
            <Bell className="w-4 h-4 mr-2" />
            Subscribe to the Newsletter
          </Button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default NewsletterPage;
