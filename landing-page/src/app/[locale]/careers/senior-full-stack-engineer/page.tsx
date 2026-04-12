"use client";
import React from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Rocket,
  Star,
  Zap,
  Globe,
  Coffee,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const jobDetails = {
  title: "Senior Full Stack Engineer",
  department: "Engineering",
  location: "Remote",
  type: "Full-time",
  experience: "5+ years",
  salary: "€65,000 - €85,000",
  tags: ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
  team: "Product & Engineering",
  reportingTo: "CTO",
};

const perks = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Remote-First",
    description: "Work from anywhere in Europe",
  },
  {
    icon: <Coffee className="w-5 h-5" />,
    title: "Learning Budget",
    description: "€1,500 for courses & conferences",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Latest Tech Stack",
    description: "Work with cutting-edge technologies",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Stock Options",
    description: "Be part of our success",
  },
];

const Body = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 mt-20">
      {/* Hero Banner */}
      <div className="relative mb-12 rounded-xl bg-gradient-to-r from-[#5E6AD2] to-[#8B92E5] p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 rounded-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm mb-6 opacity-80">
            <Link href="/careers" className="hover:opacity-100 transition-opacity">
              Careers
            </Link>
            <span>/</span>
            <span>Engineering</span>
          </div>

          <h1 className="text-4xl font-bold mb-6">{jobDetails.title}</h1>

          <div className="flex flex-wrap gap-4 items-center text-sm mb-8">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{jobDetails.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{jobDetails.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{jobDetails.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>{jobDetails.experience}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {jobDetails.tags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* About the Role - with improved styling */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl border p-6 hover:border-[#5E6AD2] transition-all"
          >
            <h2 className="text-2xl font-bold mb-4">About the Role</h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re looking for a Senior Full Stack Engineer to join our growing
              engineering team. You&apos;ll be working on our core platform, building
              new features and improving existing ones. As a senior member of
              the team, you&apos;ll also mentor junior developers and contribute to
              technical decisions that shape our product.
            </p>
          </motion.section>

          {/* Perks Section - New */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Perks & Benefits</h2>
            <div className="grid grid-cols-2 gap-4">
              {perks.map((perk, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                  <div className="text-[#5E6AD2]">{perk.icon}</div>
                  <div>
                    <h3 className="font-medium mb-1">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Responsibilities - with improved styling */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border p-6 hover:border-[#5E6AD2] transition-all"
          >
            <h2 className="text-2xl font-bold mb-4">What You&apos;ll Do</h2>
            <ul className="space-y-4">
              {[
                "Design and implement new features for our platform",
                "Write clean, maintainable, and well-tested code",
                "Review code and provide constructive feedback",
                "Mentor junior developers and share knowledge",
                "Contribute to technical architecture decisions",
                "Work closely with product and design teams",
                "Participate in agile ceremonies and planning",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5E6AD2] mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Requirements - with card style */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl border p-6 hover:border-[#5E6AD2] transition-all"
          >
            <h2 className="text-2xl font-bold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {[
                "5+ years of experience in full stack development",
                "Strong expertise in React, Node.js, and TypeScript",
                "Experience with cloud services (AWS preferred)",
                "Knowledge of database design and optimization",
                "Understanding of CI/CD practices",
                "Excellent problem-solving skills",
                "Strong communication skills in English",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5E6AD2] mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Nice to Have - with subtle background */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Nice to Have</h2>
            <ul className="space-y-3">
              {[
                "Experience with GraphQL",
                "Contribution to open source projects",
                "Knowledge of software architecture patterns",
                "Experience with real-time applications",
                "Understanding of startup ecosystems",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5E6AD2] mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Sidebar - with improved styling and navbar offset */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-32"
          >
            {/* Quick Info - with gradient border */}
            <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all mb-6">
              <h3 className="font-medium mb-4">Quick Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Team: {jobDetails.team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  <span>Reports to: {jobDetails.reportingTo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Expected start: ASAP</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Salary: {jobDetails.salary}</span>
                </div>
              </div>
            </div>

            {/* Apply Button - with animation */}
            <Link 
              href="/careers/senior-full-stack-engineer/apply"
              className="group block w-full text-center px-6 py-4 rounded-lg bg-[#5E6AD2] text-white hover:bg-[#4F58B0] transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                Apply for this Position
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Share Links - New */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-[#5E6AD2] transition-colors">Share</button>
              <span>•</span>
              <button className="hover:text-[#5E6AD2] transition-colors">Save</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const JobPage = () => {
  return (
    <Builder
      title="Senior Full Stack Engineer | Careers at Onefive"
      description="Join our engineering team and help build the future of startup ecosystem"
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Careers"
    />
  );
};

export default JobPage;
