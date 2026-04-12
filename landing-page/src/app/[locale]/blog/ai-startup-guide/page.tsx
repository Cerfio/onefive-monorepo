"use client";
import React from "react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Share2,
  BookmarkPlus,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Eye,
  Bookmark,
  Flame,
  Globe,
  Tags,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useScroll } from "framer-motion";

// Type pour le contenu Strapi
type StrapiContent = {
  type: string;
  children: {
    type: string;
    text: string;
  }[];
}[];

// utils/api.ts
async function getArticle(slug: string) {
  const response = await fetch(
    `${process.env.STRAPI_API_URL}/api/articles/${slug}?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    }
  );
  return response.json();
}

const mockContent = [
  {
    type: "heading",
    level: 2,
    children: [
      {
        type: "text",
        text: "The Rise of AI-First Companies",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        type: "text",
        text: "In today's rapidly evolving technological landscape, artificial intelligence is no longer just a buzzword—it's becoming the foundation of innovative startups. An AI-first approach means building your company's core products and services around artificial intelligence capabilities from day one.",
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [
      {
        type: "text",
        text: "Key Components of an AI-First Strategy",
      },
    ],
  },
  {
    type: "list",
    format: "bullet",
    children: [
      {
        type: "list-item",
        children: [{ type: "text", text: "Data Strategy and Infrastructure" }],
      },
      {
        type: "list-item",
        children: [
          { type: "text", text: "AI Model Development and Deployment" },
        ],
      },
      {
        type: "list-item",
        children: [
          { type: "text", text: "Ethical Considerations and Governance" },
        ],
      },
      {
        type: "list-item",
        children: [{ type: "text", text: "Team Building and Expertise" }],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    children: [
      {
        type: "text",
        text: "Building Your Foundation",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        type: "text",
        text: "The success of an AI startup heavily depends on its foundation. This includes not only the technical infrastructure but also the right team, processes, and culture. Here are the essential elements you need to consider:",
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [
      {
        type: "text",
        text: "1. Data Infrastructure",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        type: "text",
        text: "Your AI models are only as good as the data they're trained on. Establishing a robust data infrastructure is crucial for:",
      },
    ],
  },
  {
    type: "list",
    format: "bullet",
    children: [
      {
        type: "list-item",
        children: [{ type: "text", text: "Data collection and storage" }],
      },
      {
        type: "list-item",
        children: [{ type: "text", text: "Data cleaning and preprocessing" }],
      },
      {
        type: "list-item",
        children: [{ type: "text", text: "Data security and compliance" }],
      },
      {
        type: "list-item",
        children: [{ type: "text", text: "Scalability considerations" }],
      },
    ],
  },
];

const BlogPost = () => {
  // Configuration des renderers personnalisés
  const renderers = {
    heading: ({
      children,
      level,
    }: {
      children: React.ReactNode;
      level: number;
    }) => {
      switch (level) {
        case 1:
          return <h1 className="text-4xl font-bold mb-6">{children}</h1>;
        case 2:
          return <h2 className="text-3xl font-bold mb-4 mt-8">{children}</h2>;
        case 3:
          return <h3 className="text-2xl font-bold mb-3 mt-6">{children}</h3>;
        default:
          return <h4 className="text-xl font-bold mb-2 mt-4">{children}</h4>;
      }
    },
    paragraph: ({ children }: { children: React.ReactNode }) => {
      return <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>;
    },
    list: {
      bullet: ({ children }: { children: React.ReactNode }) => {
        return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
      },
      number: ({ children }: { children: React.ReactNode }) => {
        return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
      },
    },
    code: ({ children }: { children: React.ReactNode }) => {
      return (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code>{children}</code>
        </pre>
      );
    },
    image: ({ src, alt }: { src: string; alt: string }) => {
      return (
        <div className="relative w-full h-[400px] my-8 rounded-xl overflow-hidden">
          <Image src={src} alt={alt} fill className="object-cover" />
        </div>
      );
    },
    // Ajoutez d'autres renderers selon vos besoins
  };

  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflowX = "hidden";

    const unsubscribe = scrollY.on("change", (latest) => {
      if (latest > 50 && !hasScrolled) {
        setHasScrolled(true);
      } else if (latest <= 50 && hasScrolled) {
        setHasScrolled(false);
      }
    });

    return () => {
      unsubscribe();
      document.body.style.overflowX = "";
    };
  }, [scrollY, hasScrolled]);

  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Navbar hasScrolled={hasScrolled} />
      <div className="flex flex-col items-center justify-center mt-[80px]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Navigation */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#5E6AD2] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-100 text-purple-800">AI & Tech</Badge>
              <Badge variant="outline" className="gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                Trending
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                English
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Building an AI-First Startup
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Key considerations and best practices for launching an AI-powered
              startup in 2024.
            </p>

            {/* Stats & Meta */}
            <div className="flex items-center justify-between border-y py-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/team/author.jpg"
                  alt="John Doe"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-muted-foreground">
                    AI Strategy Consultant
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Mar 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8 min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>2.5K views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-12">
            <Image
              src="/blog/ai-startup.webp"
              alt="AI Startup Guide"
              fill
              className="object-cover"
            />
          </div>

          {/* Actions Bar */}
          <div className="sticky top-4 z-10 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border mb-12">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm hover:text-[#5E6AD2]">
                <ThumbsUp className="w-4 h-4" />
                <span>128 likes</span>
              </button>
              <button className="flex items-center gap-2 text-sm hover:text-[#5E6AD2]">
                <MessageSquare className="w-4 h-4" />
                <span>24 Comments</span>
              </button>
              <div className="flex items-center gap-2 text-sm">
                <Bookmark className="w-4 h-4" />
                <span>156 saves</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm hover:text-[#5E6AD2]">
                <BookmarkPlus className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 text-sm hover:text-[#5E6AD2]">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Content avec Strapi Blocks Renderer */}
          <div className="prose prose-lg max-w-none">
            <BlocksRenderer content={mockContent as any} />
          </div>

          {/* Tags Section */}
          <div className="my-8 pt-8 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Tags className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Related Topics:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="hover:bg-accent">
                Artificial Intelligence
              </Badge>
              <Badge variant="outline" className="hover:bg-accent">
                Startup
              </Badge>
              <Badge variant="outline" className="hover:bg-accent">
                Technology
              </Badge>
              <Badge variant="outline" className="hover:bg-accent">
                Machine Learning
              </Badge>
              <Badge variant="outline" className="hover:bg-accent">
                Business Strategy
              </Badge>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
            <div className="h-full bg-[#5E6AD2] w-[45%]" />{" "}
            {/* Width contrôlée par JS */}
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-4">
              <Image
                src="/team/author.jpg"
                alt="John Doe"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="font-medium mb-2">Written by John Doe</h3>
                <p className="text-muted-foreground mb-4">
                  John is an AI Strategy Consultant with over 10 years of
                  experience in helping startups implement AI solutions. He
                  previously led AI initiatives at several successful tech
                  startups.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="/team/john-doe"
                    className="text-sm text-[#5E6AD2] hover:underline"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/blog?author=john-doe"
                    className="text-sm text-[#5E6AD2] hover:underline"
                  >
                    More Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-3 gap-6">
              <Link
                href="/blog/ai-ethics"
                className="group block rounded-xl border hover:border-[#5E6AD2] transition-all overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/blog/ai-ethics.webp"
                    alt="AI Ethics"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-800">
                    AI & Tech
                  </Badge>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2 group-hover:text-[#5E6AD2] transition-colors">
                    Ethics in AI: Building Responsible AI Products
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Essential guidelines for developing ethical AI solutions and
                    maintaining user trust.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/team/sarah.jpg"
                        alt="Sarah Chen"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm">Sarah Chen</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Mar 12, 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>6 min read</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        <span>1.2K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                href="/blog/ai-team-building"
                className="group block rounded-xl border hover:border-[#5E6AD2] transition-all overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/blog/ai-team.webp"
                    alt="AI Team Building"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800">
                    Team
                  </Badge>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2 group-hover:text-[#5E6AD2] transition-colors">
                    Building Your AI Development Team
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    How to recruit, structure, and manage a high-performing AI
                    development team.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/team/michael.jpg"
                        alt="Michael Park"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm">Michael Park</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Mar 10, 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>10 min read</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        <span>1.8K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                href="/blog/ai-funding"
                className="group block rounded-xl border hover:border-[#5E6AD2] transition-all overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/blog/ai-funding.webp"
                    alt="AI Startup Funding"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-100 text-green-800">
                    Funding
                  </Badge>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2 group-hover:text-[#5E6AD2] transition-colors">
                    Funding Strategies for AI Startups
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    Navigate the unique challenges of raising capital for
                    AI-focused startups.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/team/emma.jpg"
                        alt="Emma Wilson"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm">Emma Wilson</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Mar 8, 2024</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>12 min read</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        <span>2.1K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default BlogPost;
