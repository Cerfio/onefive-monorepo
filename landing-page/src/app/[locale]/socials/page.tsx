"use client";
import React from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Rss,
  Mail,
  MessageCircle,
  Calendar,
  BookOpen,
  Radio,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const socialNetworks = [
  {
    name: "LinkedIn",
    handles: [
      {
        lang: "FR",
        flag: "🇫🇷",
        handle: "@onefive-fr",
        url: "https://linkedin.com/company/onefive-fr",
        followers: "8K+",
      },
      {
        lang: "EN",
        flag: "🇺🇸 🇬🇧",
        handle: "@onefive",
        url: "https://linkedin.com/company/onefive",
        followers: "15K+",
      },
    ],
    icon: <Linkedin className="w-6 h-6" />,
    content: {
      fr: "Actualités de l'entreprise & écosystème startup",
      en: "Company updates & startup ecosystem",
    },
    color: "bg-[#0077B5]",
  },
  {
    name: "X (Twitter)",
    handles: [
      {
        lang: "FR",
        flag: "🇫🇷",
        handle: "@onefive_fr",
        url: "https://twitter.com/onefive_fr",
        followers: "5K+",
      },
      {
        lang: "EN",
        flag: "🇺🇸 🇬🇧",
        handle: "@onefive",
        url: "https://twitter.com/onefive",
        followers: "8K+",
      },
    ],
    icon: <Twitter className="w-6 h-6" />,
    content: {
      fr: "Conseils quotidiens & conversations",
      en: "Daily tips & conversations",
    },
    color: "bg-black",
  },
  {
    name: "Instagram",
    handle: "@onefive.co",
    url: "https://instagram.com/onefive",
    icon: <Instagram className="w-6 h-6" />,
    followers: "5K+",
    content: "Behind the scenes & team culture",
    color: "bg-[#E4405F]",
  },
  {
    name: "YouTube",
    handle: "Onefive",
    url: "https://youtube.com/@onefive",
    icon: <Youtube className="w-6 h-6" />,
    followers: "2K+",
    content: "Tutorials & founder interviews",
    color: "bg-[#FF0000]",
  },
  {
    name: "TikTok",
    handle: "@onefive",
    url: "https://tiktok.com/@onefive",
    icon: (
      <Image
        src="/footer/tiktok_footer.svg"
        alt="TikTok"
        width={24}
        height={24}
      />
    ),
    followers: "1K+",
    content: "Short-form content & trends",
    color: "bg-black",
  },
  {
    name: "Facebook",
    handle: "@onefive",
    url: "https://facebook.com/onefive",
    icon: (
      <Image
        src="/footer/facebook_footer.svg"
        alt="Facebook"
        width={24}
        height={24}
      />
    ),
    followers: "3K+",
    content: "Community updates & events",
    color: "bg-[#1877F2]",
  },
  {
    name: "GitHub",
    handle: "@onefive-social-network",
    url: "https://github.com/Onefive-Social-Network",
    icon: (
      <Image
        src="/footer/github_footer.svg"
        alt="GitHub"
        width={24}
        height={24}
      />
    ),
    followers: "500+",
    content: "Open source projects & code",
    color: "bg-[#333333]",
  },
];

const otherChannels = [
  {
    name: "Blog",
    description: "Deep dives into startup topics",
    icon: <BookOpen className="w-6 h-6" />,
    url: "/blog",
    updates: "Weekly posts",
  },
  {
    name: "Newsletter",
    description: "Curated startup insights",
    icon: <Mail className="w-6 h-6" />,
    url: "/newsletter",
    updates: "Every Tuesday",
  },
  {
    name: "Events",
    description: "Virtual & in-person meetups",
    icon: <Calendar className="w-6 h-6" />,
    url: "/events",
    updates: "Monthly events",
  },
  {
    name: "Podcast",
    description: "Founder stories & lessons",
    icon: <Radio className="w-6 h-6" />,
    url: "/podcast",
    updates: "New episode every Friday",
  },
];

const communitySpaces = [
  {
    name: "Discord Community",
    description: "Join 5000+ founders & makers",
    icon: <MessageCircle className="w-6 h-6" />,
    members: "5,000+",
    url: "/discord",
  },
  {
    name: "GitHub",
    description: "Open source projects & tools",
    icon: <Github className="w-6 h-6" />,
    members: "500+",
    url: "https://github.com/onefive",
  },
  {
    name: "RSS Feed",
    description: "Stay updated with our content",
    icon: <Rss className="w-6 h-6" />,
    url: "/feed.xml",
  },
];

const pressKit = {
  logos: [
    { name: "Logo Dark", url: "/press/logo-dark.png" },
    { name: "Logo Light", url: "/press/logo-light.png" },
    { name: "Symbol", url: "/press/symbol.png" },
  ],
  brandColors: [
    { name: "Primary", color: "#5E6AD2" },
    { name: "Secondary", color: "#8B92E5" },
    { name: "Accent", color: "#F0F1FA" },
  ],
};

const Body = () => {
  const [selectedLang, setSelectedLang] = React.useState("fr");

  return (
    <div className="max-w-7xl mx-auto px-8 mt-16">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedLang("fr")}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
              selectedLang === "fr" ? "bg-gray-100" : ""
            }`}
          >
            <span className="text-lg" role="img" aria-label="FR">
              🇫🇷
            </span>
            <span>Français</span>
          </button>
          <button
            onClick={() => setSelectedLang("en")}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
              selectedLang === "en" ? "bg-gray-100" : ""
            }`}
          >
            <span className="text-lg" role="img" aria-label="EN">
              🇺🇸 🇬🇧
            </span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Social Networks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {socialNetworks.map((network) => (
          <div
            key={network.name}
            className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${network.color} p-3 rounded-lg text-white`}>
                {network.icon}
              </div>
              <div className="flex gap-2">
                {network.handles?.map((handle) => (
                  <Badge key={handle.lang} variant="secondary">
                    {handle.followers}
                  </Badge>
                ))}
              </div>
            </div>

            <h3 className="font-medium mb-3">{network.name}</h3>

            {/* Show only selected language handle */}
            <div className="space-y-3 mb-4">
              {network.handles
                ?.filter((handle) => handle.lang.toLowerCase() === selectedLang)
                .map((handle) => (
                  <a
                    key={handle.lang}
                    href={handle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {handle.handle}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
            </div>

            {/* Show content in selected language */}
            <div className="text-sm">
              {typeof network.content === "object" ? (
                <p>
                  {selectedLang === "fr"
                    ? network.content.fr
                    : network.content.en}
                </p>
              ) : (
                <p>{network.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Other Channels */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8">More Ways to Follow Us</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherChannels.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="text-[#5E6AD2] mb-4">{channel.icon}</div>
              <h3 className="font-medium mb-1">{channel.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {channel.description}
              </p>
              <Badge variant="outline">{channel.updates}</Badge>
            </a>
          ))}
        </div>
      </div>

      {/* Community Spaces */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Join Our Community</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {communitySpaces.map((space) => (
            <a
              key={space.name}
              href={space.url}
              className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="text-[#5E6AD2] mb-4">{space.icon}</div>
              <h3 className="font-medium mb-1">{space.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {space.description}
              </p>
              {space.members && (
                <Badge variant="outline">{space.members}</Badge>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Press Kit */}
      <div className="bg-gray-50 rounded-xl p-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Press Kit</h2>
          <Link
            href="/media-kit"
            className="text-[#5E6AD2] hover:underline flex items-center gap-2"
          >
            View all assets
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Logos */}
          <div>
            <h3 className="font-medium mb-4">Logos</h3>
            <div className="grid grid-cols-3 gap-4">
              {pressKit.logos.map((logo) => (
                <div key={logo.name} className="border rounded-lg p-4 bg-white">
                  <div className="aspect-square relative mb-2">
                    <Image
                      src={logo.url}
                      alt={logo.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {logo.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div>
            <h3 className="font-medium mb-4">Brand Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              {pressKit.brandColors.map((brand) => (
                <div
                  key={brand.name}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div
                    className="w-full aspect-square rounded-md mb-2"
                    style={{ backgroundColor: brand.color }}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    {brand.name}
                  </p>
                  <p className="text-xs text-center">{brand.color}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialsPage = () => {
  return (
    <Builder
      title="Connect with Onefive"
      description="Follow us across our social networks and join our community"
      image={null}
      displayJoinWaitlist={false}
      body={<Body />}
      badge="Socials"
    />
  );
};

export default SocialsPage;
