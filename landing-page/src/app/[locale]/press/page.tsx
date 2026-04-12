"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  ArrowRight,
  Calendar,
  FileText,
  Newspaper,
} from "lucide-react";

const PressPage = () => {
  const pressReleases = [
    {
      title: "Onefive Raises €10M to Accelerate European Startup Growth",
      date: "March 15, 2024",
      description:
        "Funding will expand platform capabilities and support more startups across Europe.",
      category: "Funding",
      link: "/press/onefive-raises-10m",
    },
    // ... autres communiqués
  ];

  const mediaCoverage = [
    {
      outlet: "TechCrunch",
      logo: "/media/techcrunch.svg",
      title: "Onefive Emerges as Key Player in European Startup Ecosystem",
      date: "March 16, 2024",
      link: "https://techcrunch.com/...",
      image: "/media/coverage1.jpg",
    },
    // ... autres articles
  ];

  const mediaKit = [
    {
      title: "Logo Package",
      description: "Download our logo in various formats",
      format: "ZIP",
      size: "12.5 MB",
      link: "/media-kit/logo-package.zip",
    },
    // ... autres ressources
  ];

  return (
    <>
      <NavigationMenuDemo />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Press Room</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Get the latest news about Onefive and discover how we're
            transforming the startup ecosystem.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-[#5E6AD2]">
              <FileText className="w-4 h-4 mr-2" />
              Latest Press Release
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Media Kit
            </Button>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Press Releases</h2>
            <Link
              href="/press/releases"
              className="text-[#5E6AD2] hover:underline flex items-center gap-2"
            >
              View all releases
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {pressReleases.map((release) => (
              <Link
                key={release.title}
                href={release.link}
                className="group p-6 rounded-xl border hover:border-[#5E6AD2] transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{release.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {release.date}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-[#5E6AD2] transition-colors">
                  {release.title}
                </h3>
                <p className="text-muted-foreground">{release.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Media Coverage */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Media Coverage</h2>
            <Link
              href="/press/coverage"
              className="text-[#5E6AD2] hover:underline flex items-center gap-2"
            >
              View all coverage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {mediaCoverage.map((article) => (
              <a
                key={article.title}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border hover:border-[#5E6AD2] transition-all overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={article.logo}
                      alt={article.outlet}
                      width={24}
                      height={24}
                    />
                    <span className="text-sm font-medium">
                      {article.outlet}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-3 group-hover:text-[#5E6AD2] transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {article.date}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Media Kit</h2>
              <p className="text-muted-foreground">
                Download official Onefive assets and guidelines
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {mediaKit.map((resource) => (
              <Link
                key={resource.title}
                href={resource.link}
                className="p-4 rounded-xl border bg-white hover:border-[#5E6AD2] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5E6AD2]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#5E6AD2]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{resource.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {resource.format} • {resource.size}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-muted-foreground mb-4">
            For press inquiries, please contact:
          </p>
          <a
            href="mailto:press@onefive.app"
            className="text-[#5E6AD2] hover:underline text-lg font-medium"
          >
            press@onefive.app
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PressPage;
