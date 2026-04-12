"use client";
import React from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Coffee,
  Zap,
  Globe,
  Laptop,
  Users,
  ArrowRight,
  Calendar,
  GraduationCap,
  Clock,
} from "lucide-react";
import Link from "next/link";

const perks = [
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "Remote or Hybrid",
    description: "Choose between fully remote or hybrid work setup",
  },
  {
    icon: <Coffee className="w-6 h-6" />,
    title: "Coffee Budget",
    description: "Monthly allowance for your favorite coffee and snacks",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Generous Time Off",
    description: "25 days paid holiday + bank holidays + birthday off",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Health & Wellness",
    description: "ClassPass membership for gym and spa treatments",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Family First",
    description: "Comprehensive maternity and paternity policies",
  },
  {
    icon: <Laptop className="w-6 h-6" />,
    title: "Premium Equipment",
    description: "Apple MacBook Pro and $200 home office budget",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Growth & Development",
    description: "Dedicated budget for training and conferences",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Location Benefits",
    description: "Pension & Health Insurance",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Loyalty Rewards",
    description: "Extra vacation day for each year of service",
  },
];

const openings: {
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  tags: string[];
}[] = [
  // {
  //   title: "Senior Full Stack Engineer",
  //   department: "Engineering",
  //   location: "Remote",
  //   type: "Full-time",
  //   experience: "5+ years",
  //   tags: ["React", "Node.js", "TypeScript"],
  // },
  // {
  //   title: "Product Manager",
  //   department: "Product",
  //   location: "Paris or Remote",
  //   type: "Full-time",
  //   experience: "3+ years",
  //   tags: ["B2B SaaS", "Startup Experience"],
  // },
  // {
  //   title: "Community Manager",
  //   department: "Community",
  //   location: "Remote",
  //   type: "Full-time",
  //   experience: "2+ years",
  //   tags: ["Startup Ecosystem", "Events"],
  // },
  // {
  //   title: "Growth Marketing Lead",
  //   department: "Marketing",
  //   location: "Remote",
  //   type: "Full-time",
  //   experience: "4+ years",
  //   tags: ["B2B", "SEO", "Content"],
  // },
];

const Body = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 mt-20">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We&apos;re building the future of startup ecosystem and we need
          talented people like you. Work with the latest technologies and shape
          the future of entrepreneurship in Europe.
        </p>
      </div>

      {/* Perks Section */}
      <div className="mb-20">
        <h3 className="text-2xl font-bold text-center mb-12">Why Join Us?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="text-[#5E6AD2] mb-4">{perk.icon}</div>
              <h4 className="text-xl font-medium mb-2">{perk.title}</h4>
              <p className="text-muted-foreground">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-20">
        <h3 className="text-2xl font-bold text-center mb-12">Open Positions</h3>
        {openings.length > 0 ? (
          <div className="space-y-4">
            {openings.map((job, index) => (
              <Link
                href={`/careers/${job.title.toLowerCase().replace(/ /g, "-")}`}
                key={index}
                className="block border rounded-xl p-6 hover:border-[#5E6AD2] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-medium mb-2 group-hover:text-[#5E6AD2] transition-colors">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{job.experience}</Badge>
                  {job.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl">
            <p className="text-muted-foreground">
              We don&apos;t have any open positions at the moment. Please check
              back later or submit a spontaneous application.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-50 rounded-xl p-12">
        <h3 className="text-2xl font-bold mb-4">
          Don&apos;t see the right role?
        </h3>
        <p className="text-muted-foreground mb-6">
          We&apos;re always looking for talented people to join our team. Send
          us your CV and we&apos;ll keep you in mind for future opportunities.
        </p>
        <Link
          href="/careers/spontaneous"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5E6AD2] text-white hover:bg-[#4F58B0] transition-colors"
        >
          Send Spontaneous Application
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const Careers = () => {
  return (
    <Builder
      title="Careers at Onefive"
      description="Join us in building the future of startup ecosystem"
      image={null}
      displayJoinWaitlist={false}
      body={<Body />}
      badge="Careers"
    />
  );
};

export default Careers;
