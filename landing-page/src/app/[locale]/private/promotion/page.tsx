"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  BarChart2,
  Rocket,
  Award,
  Target,
  Briefcase,
  BarChart,
  Share2,
  ArrowUpRight,
  Calendar,
  Mail,
  Globe,
  PieChart,
  ArrowRight,
  MessageSquare,
  Heart,
  ChevronDown,
  Plus,
  Edit,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const PromotionPage = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedStartup, setSelectedStartup] = useState<string>("startup-1");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Données des startups disponibles
  const startups = [
    {
      id: "startup-1",
      name: "Acme Inc.",
      logo: "/startup-logos/acme.png",
      tagline: "Revolutionizing enterprise automation with AI",
      stage: "Series A",
      industry: "SaaS / Enterprise",
      founded: "2021",
      location: "Paris, France",
      website: "https://acme-startup.co",
      raisedAmount: "€4.5M",
      employees: 24,
      metrics: {
        mrr: "€85K",
        growth: "22%",
        customers: 48,
        retention: "94%",
      },
      overview:
        "Acme is building the next generation of enterprise automation tools powered by artificial intelligence. Our platform connects disparate systems and automates complex workflows, reducing manual tasks by up to 80% while improving accuracy and compliance.",
      problem:
        "Enterprises struggle with disconnected systems, manual processes, and increasing operational complexity. This leads to inefficiencies, errors, and high operational costs.",
      solution:
        "Our platform uses AI to understand, connect, and automate enterprise workflows across different systems. We provide pre-built connectors to popular enterprise tools and a visual workflow builder that requires no coding skills.",
      marketPotential:
        "The enterprise automation market is projected to reach $19.6B by 2026, growing at 24% CAGR.",
      companyStage:
        "We've secured €4.5M in Series A funding led by Venture Capital Partners, with participation from Tech Ventures and Angel Investors Group.",
    },
    {
      id: "startup-2",
      name: "TechFuture SAS",
      logo: "/startup-logos/techfuture.png",
      tagline: "Clean energy solutions for modern cities",
      stage: "Seed",
      industry: "CleanTech",
      founded: "2022",
      location: "Lyon, France",
      website: "https://techfuture.fr",
      raisedAmount: "€800K",
      employees: 9,
      metrics: {
        mrr: "€25K",
        growth: "35%",
        customers: 12,
        retention: "91%",
      },
      overview:
        "TechFuture develops innovative clean energy solutions for urban environments. Our solar-integrated construction materials help buildings generate their own power while maintaining aesthetic appeal.",
      problem:
        "Urban buildings consume massive amounts of energy, contributing significantly to carbon emissions. Traditional solar panels are often rejected for aesthetic reasons or space constraints.",
      solution:
        "We've developed construction materials with integrated solar cells that look indistinguishable from premium building materials while generating clean energy.",
      marketPotential:
        "The building-integrated photovoltaics market is expected to grow to €8.2B by 2027.",
      companyStage:
        "We've raised €800K in seed funding and have completed pilot installations with 3 major property developers.",
    },
    {
      id: "startup-3",
      name: "NextGen Solutions",
      logo: "/startup-logos/nextgen.png",
      tagline: "Democratizing financial access with blockchain",
      stage: "Pre-seed",
      industry: "FinTech / Blockchain",
      founded: "2023",
      location: "Bordeaux, France",
      website: "https://nextgensol.io",
      raisedAmount: "€350K",
      employees: 5,
      metrics: {
        mrr: "€8K",
        growth: "48%",
        customers: 350,
        retention: "89%",
      },
      overview:
        "NextGen Solutions is building a blockchain-based platform that enables underserved communities to access financial services without traditional banking infrastructure.",
      problem:
        "Over 1.7 billion adults globally remain unbanked, lacking access to basic financial services that could improve their economic prospects.",
      solution:
        "Our mobile-first platform uses blockchain to provide secure, low-cost financial services including payments, savings, and microloans without requiring traditional banking infrastructure.",
      marketPotential:
        "The global unbanked population represents a $380B market opportunity.",
      companyStage:
        "We've secured €350K in pre-seed funding and launched a successful pilot in two markets with 350 active users.",
    },
  ];

  // Données de l'équipe
  const teams = {
    "startup-1": [
      {
        id: 1,
        name: "Sophie Martin",
        role: "CEO & Co-founder",
        avatar: "/avatars/sophie.jpg",
        linkedin: "https://linkedin.com/in/sophiemartin",
      },
      {
        id: 2,
        name: "Thomas Dubois",
        role: "CTO & Co-founder",
        avatar: "/avatars/thomas.jpg",
        linkedin: "https://linkedin.com/in/thomasdubois",
      },
      {
        id: 3,
        name: "Julie Lefebvre",
        role: "Head of Product",
        avatar: "/avatars/julie.jpg",
        linkedin: "https://linkedin.com/in/julielefebvre",
      },
      {
        id: 4,
        name: "Nicolas Bernard",
        role: "Head of Sales",
        avatar: "/avatars/nicolas.jpg",
        linkedin: "https://linkedin.com/in/nicolasbernard",
      },
      {
        id: 5,
        name: "Emma Petit",
        role: "Lead Engineer",
        avatar: "/avatars/emma.jpg",
        linkedin: "https://linkedin.com/in/emmapetit",
      },
    ],
    "startup-2": [
      {
        id: 1,
        name: "Lucas Moreau",
        role: "CEO & Founder",
        avatar: "/avatars/lucas.jpg",
        linkedin: "https://linkedin.com/in/lucasmoreau",
      },
      {
        id: 2,
        name: "Clara Simon",
        role: "CTO",
        avatar: "/avatars/clara.jpg",
        linkedin: "https://linkedin.com/in/clarasimon",
      },
      {
        id: 3,
        name: "Antoine Dupont",
        role: "Head of R&D",
        avatar: "/avatars/antoine.jpg",
        linkedin: "https://linkedin.com/in/antoinedupont",
      },
    ],
    "startup-3": [
      {
        id: 1,
        name: "Léa Robert",
        role: "CEO & Co-founder",
        avatar: "/avatars/lea.jpg",
        linkedin: "https://linkedin.com/in/learobert",
      },
      {
        id: 2,
        name: "Maxime Fournier",
        role: "CTO & Co-founder",
        avatar: "/avatars/maxime.jpg",
        linkedin: "https://linkedin.com/in/maximefournier",
      },
    ],
  };

  // Données des produits/services
  const products = {
    "startup-1": [
      {
        id: 1,
        name: "AutoConnect",
        description:
          "Integration platform that connects to over 200 enterprise applications",
        image: "/products/autoconnect.jpg",
        features: [
          "Drag-and-drop interface",
          "Pre-built connectors",
          "Real-time monitoring",
        ],
      },
      {
        id: 2,
        name: "WorkflowAI",
        description:
          "AI-powered workflow automation with natural language processing",
        image: "/products/workflowai.jpg",
        features: [
          "Process mining",
          "Automated workflow suggestions",
          "Compliance checks",
        ],
      },
      {
        id: 3,
        name: "DataInsight",
        description: "Business intelligence dashboards for automation metrics",
        image: "/products/datainsight.jpg",
        features: [
          "Custom dashboards",
          "Automation ROI tracking",
          "Anomaly detection",
        ],
      },
    ],
    "startup-2": [
      {
        id: 1,
        name: "SolarTile",
        description: "Premium roof tiles with integrated solar cells",
        image: "/products/solartile.jpg",
        features: [
          "Indistinguishable from premium tiles",
          "15% efficiency",
          "Easy installation",
        ],
      },
      {
        id: 2,
        name: "PowerFacade",
        description:
          "Energy-generating facade elements for commercial buildings",
        image: "/products/powerfacade.jpg",
        features: ["Custom designs", "Retrofittable", "Hail resistant"],
      },
    ],
    "startup-3": [
      {
        id: 1,
        name: "CryptoWallet",
        description:
          "Secure mobile wallet for crypto and traditional currencies",
        image: "/products/cryptowallet.jpg",
        features: [
          "Biometric security",
          "Cross-border transfers",
          "Multi-currency support",
        ],
      },
      {
        id: 2,
        name: "MicroLoan",
        description: "Blockchain-based microlending platform",
        image: "/products/microloan.jpg",
        features: [
          "Credit scoring AI",
          "Peer-to-peer lending",
          "Flexible repayments",
        ],
      },
    ],
  };

  // Données des témoignages
  const testimonials = {
    "startup-1": [
      {
        id: 1,
        text: "Acme's platform has reduced our manual processing time by 75% and virtually eliminated data entry errors.",
        author: "Jean Dupont",
        position: "CIO, Global Enterprises SA",
        company: "/logos/globalenterprises.png",
      },
      {
        id: 2,
        text: "The ROI was clear within the first quarter. We've been able to reassign 12 full-time employees to more strategic work.",
        author: "Marie Lambert",
        position: "Operations Director, TechCorp",
        company: "/logos/techcorp.png",
      },
    ],
    "startup-2": [
      {
        id: 1,
        text: "TechFuture's solar tiles have transformed our development. We can now offer energy-positive buildings without compromising on design.",
        author: "Philippe Rousseau",
        position: "Head of Development, Urban Constructors",
        company: "/logos/urbanconstruct.png",
      },
    ],
    "startup-3": [
      {
        id: 1,
        text: "NextGen has allowed our community to access financial services for the first time. The impact has been transformative.",
        author: "Fatou Diallo",
        position: "Community Leader, Senegal",
        company: null,
      },
    ],
  };

  // Sélectionner la startup active
  const activeStartup =
    startups.find((s) => s.id === selectedStartup) || startups[0];
  const activeTeam = teams[selectedStartup as keyof typeof teams] || [];
  const activeProducts =
    products[selectedStartup as keyof typeof products] || [];
  const activeTestimonials =
    testimonials[selectedStartup as keyof typeof testimonials] || [];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <Navbar hasScrolled={false} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#101828]">
                Startup Showcase
              </h1>
              <Select
                value={selectedStartup}
                onValueChange={setSelectedStartup}
              >
                <SelectTrigger className="w-[200px] h-9 border-dashed">
                  <SelectValue placeholder="Sélectionner une startup" />
                </SelectTrigger>
                <SelectContent>
                  {startups.map((startup) => (
                    <SelectItem key={startup.id} value={startup.id}>
                      {startup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground mt-1">
              Discover innovative startups and their transformative solutions
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="outline" className="rounded-lg">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              className="rounded-lg bg-[#5E6AD2] hover:bg-[#4F5AC3]"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Main content with tabs */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          {/* Company header */}
          <div className="p-6 md:p-8 border-b">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 relative rounded-lg overflow-hidden bg-gray-100 border">
                {activeStartup.logo ? (
                  <Image
                    src={activeStartup.logo}
                    alt={activeStartup.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <Briefcase className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#101828]">
                      {activeStartup.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {activeStartup.tagline}
                    </p>
                  </div>

                  <Badge className="self-start md:self-auto bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 px-3 py-1 text-sm font-medium">
                    {activeStartup.stage}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{activeStartup.industry}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Founded {activeStartup.founded}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>{activeStartup.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{activeStartup.employees} employees</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <BarChart className="w-4 h-4 mr-2" />
                    <span>Raised {activeStartup.raisedAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs navigation */}
          <div className="border-b">
            <Tabs
              defaultValue="overview"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <div className="px-6">
                <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                </TabsList>
              </div>

              {/* Overview tab */}
              <TabsContent value="overview" className="p-6 md:p-8 space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      About {activeStartup.name}
                    </h3>
                    <p className="text-gray-700">{activeStartup.overview}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-5 border">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Target className="w-4 h-4 text-amber-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          The Problem
                        </h4>
                      </div>
                      <p className="text-gray-700">{activeStartup.problem}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 border">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Rocket className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          Our Solution
                        </h4>
                      </div>
                      <p className="text-gray-700">{activeStartup.solution}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-5 border">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <PieChart className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          Market Potential
                        </h4>
                      </div>
                      <p className="text-gray-700">
                        {activeStartup.marketPotential}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 border">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Award className="w-4 h-4 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          Company Stage
                        </h4>
                      </div>
                      <p className="text-gray-700">
                        {activeStartup.companyStage}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-center md:justify-start">
                  <Link href={activeStartup.website} target="_blank" passHref>
                    <Button variant="outline" className="rounded-lg mr-4">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </Link>
                  <Button className="rounded-lg bg-[#5E6AD2] hover:bg-[#4F5AC3]">
                    Contact Startup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Metrics tab */}
              <TabsContent value="metrics" className="p-6 md:p-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-6">
                    Key Performance Indicators
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-5 border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-500 text-sm">
                          Monthly Revenue
                        </h4>
                        <BarChart className="w-4 h-4 text-[#5E6AD2]" />
                      </div>
                      <p className="text-2xl font-semibold mt-2">
                        {activeStartup.metrics.mrr}
                      </p>
                      <div className="flex items-center mt-2 text-green-600 text-sm">
                        <div className="flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          <span>{activeStartup.metrics.growth} MoM</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-500 text-sm">Customers</h4>
                        <Users className="w-4 h-4 text-[#5E6AD2]" />
                      </div>
                      <p className="text-2xl font-semibold mt-2">
                        {activeStartup.metrics.customers}
                      </p>
                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <span>Active accounts</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-500 text-sm">Retention</h4>
                        <Heart className="w-4 h-4 text-[#5E6AD2]" />
                      </div>
                      <p className="text-2xl font-semibold mt-2">
                        {activeStartup.metrics.retention}
                      </p>
                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <span>Monthly retention</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-500 text-sm">Team Size</h4>
                        <Users className="w-4 h-4 text-[#5E6AD2]" />
                      </div>
                      <p className="text-2xl font-semibold mt-2">
                        {activeStartup.employees}
                      </p>
                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <span>Full-time employees</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-lg p-5 border">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Monthly Growth
                      </h4>
                      <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                        <p className="text-gray-400">
                          [Growth Chart Placeholder]
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Customer Segments
                      </h4>
                      <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                        <p className="text-gray-400">
                          [Segments Chart Placeholder]
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Team tab */}
              <TabsContent value="team" className="p-6 md:p-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-6">Our Team</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTeam.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-lg border overflow-hidden"
                      >
                        <div className="h-40 bg-gray-100 relative">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Avatar className="w-20 h-20">
                                <AvatarFallback>
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          <p className="text-gray-500 text-sm">{member.role}</p>

                          <div className="mt-4 pt-4 border-t">
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5E6AD2] text-sm flex items-center hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              LinkedIn Profile
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeTeam.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No team members added yet
                      </h4>
                      <p className="text-gray-500">
                        Add team members to showcase the people behind your
                        startup.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Products tab */}
              <TabsContent value="products" className="p-6 md:p-8">
                <div className="space-y-8">
                  <h3 className="text-lg font-semibold mb-6">
                    Products & Services
                  </h3>

                  {activeProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg border overflow-hidden"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto relative bg-gray-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Briefcase className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:w-2/3">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {product.name}
                          </h4>
                          <p className="text-gray-700 mb-4">
                            {product.description}
                          </p>

                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-gray-900">
                              Key Features:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {product.features.map((feature, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeProducts.length === 0 && (
                    <div className="text-center py-12">
                      <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No products added yet
                      </h4>
                      <p className="text-gray-500">
                        Add products or services to showcase what your startup
                        offers.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Testimonials tab */}
              <TabsContent value="testimonials" className="p-6 md:p-8">
                <div className="space-y-8">
                  <h3 className="text-lg font-semibold mb-6">
                    Customer Testimonials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTestimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-white rounded-lg border p-6"
                      >
                        <div className="flex items-center mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 my-4 italic">
                          "{testimonial.text}"
                        </p>

                        <div className="flex items-center mt-6">
                          <div className="mr-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>
                                {testimonial.author
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {testimonial.author}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {testimonial.position}
                            </p>
                          </div>
                          {testimonial.company && (
                            <div className="ml-auto">
                              <div className="w-16 h-8 relative">
                                <Image
                                  src={testimonial.company}
                                  alt={testimonial.author}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeTestimonials.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No testimonials added yet
                      </h4>
                      <p className="text-gray-500">
                        Add customer testimonials to build credibility.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Contact section */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>

            <div className="bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-gray-700 mb-2">
                  Interested in learning more about {activeStartup.name}?
                </p>
                <p className="text-gray-500">
                  Contact the team for investment opportunities, partnerships,
                  or questions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="rounded-lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button className="rounded-lg bg-[#5E6AD2] hover:bg-[#4F5AC3]">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Invest Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour éditer le profil */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Startup Profile</DialogTitle>
            <DialogDescription>
              Update your startup's information and showcase your progress
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <p className="text-center text-gray-500 py-8">
              [Éditeur de profil - à implémenter selon les besoins]
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-[#5E6AD2] hover:bg-[#4F5AC3]"
              onClick={() => setIsEditModalOpen(false)}
            >
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionPage;
