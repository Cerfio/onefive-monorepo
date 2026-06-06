"use client";
import React, { useState, useMemo, useEffect } from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Bug,
  Sparkles,
  Rocket,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  Shield,
  Search,
  Calendar,
  Filter,
  Download,
  Rss,
  AlertCircle,
} from "lucide-react";

type ChangeType = "feature" | "improvement" | "bugfix" | "security";

interface Change {
  type: ChangeType;
  title: string;
  description: string;
}

interface Release {
  id: string;
  version: string;
  date: string;
  summary: string;
  changes: Change[];
  isLatest?: boolean;
}

const changeTypeConfig: Record<
  ChangeType,
  { icon: React.ReactElement; color: string; label: string }
> = {
  feature: {
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
    label: "New Feature",
  },
  improvement: {
    icon: <ThumbsUp className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
    label: "Improvement",
  },
  bugfix: {
    icon: <Bug className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
    label: "Bug Fix",
  },
  security: {
    icon: <Shield className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
    label: "Security",
  },
};

const Body = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedType, setSelectedType] = useState<ChangeType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Récupération des données depuis PayloadCMS
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/releases?limit=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch releases data');
        }
        
        const data = await response.json();
        
        // Transformer les dates de PayloadCMS au format souhaité
        const formattedReleases = data.docs.map((release: any) => ({
          id: release.id,
          version: release.version,
          date: new Date(release.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric', 
            year: 'numeric'
          }),
          summary: release.summary,
          changes: release.changes || [],
          isLatest: release.isLatest || false,
        }));
        
        // Trier par date (plus récent en premier)
        formattedReleases.sort((a: Release, b: Release) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setReleases(formattedReleases);
      } catch (err) {
        console.error('Error fetching releases:', err);
        setError('Could not load changelog data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  // Get unique years from releases
  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(
        releases.map((release) =>
          new Date(release.date).getFullYear().toString()
        )
      ),
    ];
    return ["all", ...uniqueYears];
  }, [releases]);

  // Filter changes based on type, search query and year
  const filterChanges = (changes: Change[]) => {
    return changes.filter((change) => {
      const matchesType =
        selectedType === "all" || change.type === selectedType;
      const matchesSearch =
        searchQuery === "" ||
        change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        change.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  // Filter releases based on year
  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      const releaseYear = new Date(release.date).getFullYear().toString();
      return selectedYear === "all" || releaseYear === selectedYear;
    });
  }, [selectedYear, releases]);

  // Stats counts
  const getCounts = useMemo(() => {
    return {
      totalUpdates: releases.length,
      features: releases.flatMap((r) => r.changes).filter((c) => c.type === "feature").length,
      improvements: releases.flatMap((r) => r.changes).filter((c) => c.type === "improvement").length,
      bugfixes: releases.flatMap((r) => r.changes).filter((c) => c.type === "bugfix").length,
    };
  }, [releases]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          
          {/* Loading filters */}
          <div className="h-12 bg-gray-200 rounded w-full max-w-xl mx-auto mb-6"></div>
          <div className="flex justify-center gap-2 mb-12">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Loading stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="h-5 bg-gray-200 rounded-full w-8 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Loading releases */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="w-full">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Changelog</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#5E6AD2] text-white rounded-md mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Product Updates</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Track our latest features, improvements, and fixes.
        </p>

        {/* Search and Filters */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search updates..."
              className="pl-10 py-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Type Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedType === "all"
                    ? "bg-[#5E6AD2] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Updates
              </button>
              {Object.entries(changeTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as ChangeType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                    selectedType === type
                      ? "bg-[#5E6AD2] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          {
            label: "Total Updates",
            value: getCounts.totalUpdates,
            icon: <Zap className="w-5 h-5" />,
          },
          {
            label: "New Features",
            value: getCounts.features,
            icon: <Sparkles className="w-5 h-5" />,
          },
          {
            label: "Improvements",
            value: getCounts.improvements,
            icon: <ThumbsUp className="w-5 h-5" />,
          },
          {
            label: "Bug Fixes",
            value: getCounts.bugfixes,
            icon: <Bug className="w-5 h-5" />,
          },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center text-[#5E6AD2] mb-2">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-12">
        {filteredReleases.length > 0 ? (
          filteredReleases.some(release => filterChanges(release.changes).length > 0) ? (
            filteredReleases.map((release, index) => {
              const filteredChanges = filterChanges(release.changes);
              if (filteredChanges.length === 0) return null;

              return (
                <div key={release.id} className="relative">
                  {/* Version Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold">{release.version}</h2>
                        {release.isLatest && (
                          <Badge className="bg-[#5E6AD2]">Latest</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">{release.date}</p>
                      <p className="text-lg">{release.summary}</p>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="ml-16 space-y-6">
                    {filteredChanges.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`rounded-lg p-2 ${changeTypeConfig[change.type].color}`}
                          >
                            {changeTypeConfig[change.type].icon}
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">{change.title}</h3>
                            <p className="text-muted-foreground">
                              {change.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connector Line */}
                  {index < filteredReleases.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No changes found matching the selected filter.
                {selectedType !== "all" && (
                  <span> Try selecting a different change type or clear your filters.</span>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No releases found matching your criteria.
            </div>
          </div>
        )}
      </div>

      {/* Additional Features */}
      <div className="mt-20 grid md:grid-cols-3 gap-6">
        <a
          href="/api/changelog/rss"
          className="flex items-center justify-center gap-2 p-4 rounded-xl border hover:border-[#5E6AD2] transition-all text-center"
        >
          <Rss className="w-5 h-5" />
          <span>RSS Feed</span>
        </a>
        <a
          href="/api/changelog/json"
          className="flex items-center justify-center gap-2 p-4 rounded-xl border hover:border-[#5E6AD2] transition-all text-center"
        >
          <Download className="w-5 h-5" />
          <span>Download JSON</span>
        </a>
        <a
          href="/feedback"
          className="flex items-center justify-center gap-2 p-4 rounded-xl border hover:border-[#5E6AD2] transition-all text-center"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Give Feedback</span>
        </a>
      </div>
    </div>
  );
};

export default function Changelog() {
  return (
    <Builder
      title="Changelog Onefive"
      description="Track our latest features, improvements, and fixes"
      image={null}
      displayJoinWaitlist={false}
      body={<Body />}
      badge="Changelog"
    />
  );
}
