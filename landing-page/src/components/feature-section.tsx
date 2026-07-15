"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeatureSection({
  title,
  description,
  linkHref,
  linkText,
  linkEnabled,
  children,
  reverseLayout = false,
  className = "",
}: {
  title: string;
  description: string;
  // Optional: a coming-soon feature has no page to point at, and keeping a
  // href for one that was deleted is how a dead link comes back the day
  // someone flips linkEnabled to true.
  linkHref?: string;
  linkText: string;
  linkEnabled: boolean;
  children: React.ReactNode;
  reverseLayout?: boolean;
  className?: string;
}) {
  return (
    <div className={`pt-16 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-4 lg:px-8 ${className}`}>
      {/* Left Column */}
      <div className={`flex flex-col justify-center order-1 ${reverseLayout ? 'lg:order-2' : 'lg:order-1'}`}>
        <h2 className="text-2xl text-center lg:text-left lg:text-3xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-base text-center lg:text-left lg:text-lg text-muted-foreground mb-6">
          {description}
        </p>
        <div className="flex justify-center lg:justify-start">
          {linkEnabled && linkHref ? (
            <Link className="w-fit" href={linkHref}>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                {linkText}
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </motion.svg>
              </Button>
            </Link>
          ) : (
            <Button disabled variant="outline">
              {linkText}
            </Button>
          )}
        </div>
      </div>

      {/* Right Column - Activity Feed */}
      <div className={`relative h-[220px] sm:h-[250px] md:h-[280px] lg:h-auto p-4 order-2 ${reverseLayout ? 'lg:order-1' : 'lg:order-2'}`}>
        {children}
      </div>
    </div>
  );
}
