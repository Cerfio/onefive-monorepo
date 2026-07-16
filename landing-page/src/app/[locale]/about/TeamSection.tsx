"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const socialIcons = {
  linkedin: (
    <Image
      src="/footer/linkedin_footer.svg"
      alt="LinkedIn"
      width={16}
      height={16}
    />
  ),
  twitter: (
    <Image src="/footer/x_footer.svg" alt="Twitter" width={16} height={16} />
  ),
  github: (
    <Image
      src="/footer/github_footer.svg"
      alt="Github"
      width={16}
      height={16}
    />
  ),
  medium: (
    <Image
      src="/footer/medium_footer.svg"
      alt="Medium"
      width={16}
      height={16}
    />
  ),
  dribbble: (
    <Image
      src="/footer/dribbble_footer.svg"
      alt="Dribbble"
      width={16}
      height={16}
    />
  ),
};

const categoryColors = {
  Founder: "bg-purple-100 text-purple-800",
  Product: "bg-blue-100 text-blue-800",
  Tech: "bg-green-100 text-green-800",
  Community: "bg-orange-100 text-orange-800",
  HR: "bg-pink-100 text-pink-800",
  Marketing: "bg-yellow-100 text-yellow-800",
};

interface TeamSectionProps {
  teamMembers: any[];
  categories: string[];
}

const TeamSection: React.FC<TeamSectionProps> = ({
  teamMembers,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredTeam = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.content ?? []).some((item: any) =>
        item.point?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || member.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, role, or experience..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? "bg-[#5E6AD2] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-2 text-xs">
                  ({teamMembers.filter((m) => m.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredTeam.length > 0 ? (
          filteredTeam.map((member) => (
            <div
              key={member.name}
              className="border rounded-xl overflow-hidden group hover:border-[#5E6AD2] transition-all max-w-[300px]"
            >
              <div className="aspect-square relative">
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/${member.image.filename}`}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                  quality={100}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{member.name}</h3>
                  <Badge
                    className={`${categoryColors[member.category as keyof typeof categoryColors]} border-none`}
                  >
                    {member.category}
                  </Badge>
                </div>
                <div className="text-sm text-[#5E6AD2] mb-2">{member.role}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  {member.bio}
                </p>

                {/* Content List */}
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  {member.content.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#5E6AD2] rounded-full" />
                      {(item as any).point}
                    </li>
                  ))}
                </ul>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2">
                  {member.socials.map((social: any, index: number) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded-md hover:border-[#5E6AD2] hover:text-[#5E6AD2] transition-all"
                      title={`Visit ${member.name}'s ${social.type}`}
                    >
                      {socialIcons[social.type as keyof typeof socialIcons]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No team members found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSection;
