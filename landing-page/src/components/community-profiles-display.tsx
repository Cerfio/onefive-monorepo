"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export type ProfileItem = {
  src: string;
  alt: string;
  tag: string;
  tagColor: string;
  borderColor: string;
  position: { top: string; left: string };
  startPosition: "up" | "down";
};

interface CommunityProfilesDisplayProps {
  backgroundCircles?: Array<{
    size: number;
    top: string;
    left: string;
    color: string;
  }>;
  profiles: ProfileItem[];
}

export default function CommunityProfilesDisplay({
  backgroundCircles = [
    { size: 400, top: "10%", left: "20%", color: "#5E6AD2" },
    { size: 300, top: "50%", left: "60%", color: "#F35C47" },
    { size: 250, top: "80%", left: "10%", color: "#5E6AD2" },
  ],
  profiles = [],
}: CommunityProfilesDisplayProps) {
  return (
    <div className="relative w-full h-full right-20 top-5 lg:right-16 lg:bottom-20">
      {/* Background Circles */}
      {backgroundCircles.map((circle, index) => (
        <div
          key={`circle-${index}`}
          className="absolute rounded-full -z-10 blur-3xl"
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            background: circle.color,
            opacity: 0.05,
          }}
        />
      ))}

      {profiles.map((item, index) => (
        <motion.div
          key={index}
          className="absolute w-fit"
          style={{
            top: item.position.top,
            left: item.position.left,
          }}
          animate={{
            y: item.startPosition === "down" ? [8, -8] : [-8, 8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex flex-col gap-2 items-center w-fit">
            <Image
              src={item.src}
              alt={item.alt}
              width={84}
              height={84}
              className={`rounded-full border-4 ${item.borderColor}`}
            />
            <div
              className={`${item.tagColor} text-white rounded-2xl px-4 py-1 text-sm font-medium`}
            >
              #{item.tag}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 