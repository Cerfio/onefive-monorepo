"use client";

import { FC, ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FloatingEmoji } from "@/components/floating-emoji";
import { AvailableLanguage } from "@/types/languages";

interface UserProfile {
  src: string;
  alt: string;
  name: string;
  email?: string;
  title?: string;
  hasOnlineIndicator?: boolean;
  hasVerifiedBadge?: boolean;
}

interface ActivityData {
  timestamp?: string;
  message?: ReactNode;
}

interface UserActivitySectionProps {
  className?: string;
  topProfile: UserProfile;
  bottomProfile: UserProfile;
  bottomActivity?: ActivityData;
  showFollowButton?: boolean;
  showConnectButton?: boolean;
  followButtonText?: string;
  connectButtonText?: string;
  language: AvailableLanguage;
}

const UserActivitySection: FC<UserActivitySectionProps> = ({
  className,
  topProfile,
  bottomProfile,
  bottomActivity,
  showFollowButton = true,
  showConnectButton = true,
  followButtonText = "Suivre",
  connectButtonText = "Se connecter",
  language,
}) => {
  return (
    <div className={`relative p-4 ${className}`}>
      {/* Desktop/Tablet layout */}
      <div className="hidden sm:block sm:relative sm:h-[192px] sm:w-[544px]">
        <div className="absolute w-full top-0 left-8">
          <FloatingEmoji position="top-left" language={language} />
        </div>

        {/* Section Profile & Connect */}
        <motion.div
          className="flex flex-col gap-3 absolute top-0 right-0 border border-gray-200 p-4 rounded-lg shadow-sm bg-white max-w-[280px]"
          animate={{ y: [-8, 8] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="flex gap-3">
            <div className="relative flex flex-col gap-3 w-fit">
              <Image
                src={topProfile.src}
                alt={topProfile.alt}
                className="rounded-full"
                width={48}
                height={48}
              />
              {topProfile.hasOnlineIndicator && (
                <div className="absolute border-[1.5px] border-white bottom-[0.1rem] right-[0.1rem] bg-[#12B76A] rounded-full w-3 h-3"></div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground text-[#101828] font-semibold">
                {topProfile.name}
              </p>
              {topProfile.email && (
                <p className="text-[12px] font-normal text-muted-foreground">
                  {topProfile.email}
                </p>
              )}
              {topProfile.title && (
                <p className="text-[12px] font-normal text-muted-foreground">
                  {topProfile.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {showFollowButton && (
              <Button variant="outline">{followButtonText}</Button>
            )}
            {showConnectButton && (
              <Button
                className="bg-[#7F56D9] border-none text-white"
                variant="outline"
              >
                {connectButtonText}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Section Activity Feed */}
        <motion.div
          className="flex gap-3 absolute bottom-0 left-0 border border-gray-200 p-4 rounded-lg shadow-sm bg-white max-w-[320px]"
          animate={{ y: [8, -8] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="relative flex flex-col gap-3 w-fit">
            <Image
              src={bottomProfile.src}
              alt={bottomProfile.alt}
              className="rounded-full"
              width={48}
              height={48}
            />
            {bottomProfile.hasVerifiedBadge && (
              <div className="absolute bottom-2 right-0 w-4 h-4">
                <Image
                  src="/verified-tick.svg"
                  alt="Verified Tick"
                  width={16}
                  height={16}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <div className="text-[#101828] font-semibold">
                {bottomProfile.name}{" "}
              </div>
              {bottomActivity?.timestamp && (
                <span className="text-[#475467] text-xs">
                  {bottomActivity.timestamp}
                </span>
              )}
            </div>
            {bottomActivity?.message && (
              <p className="text-sm text-muted-foreground">
                {bottomActivity.message}
              </p>
            )}
          </div>
        </motion.div>

        <div className="absolute w-full bottom-0 right-0 sm:left-8">
          <FloatingEmoji position="bottom-right" language={language} />
        </div>
      </div>

      {/* Mobile layout (phones only) */}
      <div className="flex flex-col gap-4 sm:hidden">
        {/* Conteneur pour le FloatingEmoji avec position relative */}
        <div className="relative h-16 w-full flex justify-center">
          <FloatingEmoji position="top-left" language={language} />
        </div>

        {/* Section Profile & Connect - Mobile */}
        <motion.div
          className="flex flex-col gap-3 border border-gray-200 p-3 rounded-lg shadow-sm bg-white w-full"
          animate={{ y: [-4, 4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="flex gap-3">
            <div className="relative flex flex-col gap-3 w-fit">
              <Image
                src={topProfile.src}
                alt={topProfile.alt}
                className="rounded-full"
                width={48}
                height={48}
              />
              {topProfile.hasOnlineIndicator && (
                <div className="absolute border-[1.5px] border-white bottom-[0.1rem] right-[0.1rem] bg-[#12B76A] rounded-full w-3 h-3"></div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground text-[#101828] font-semibold">
                {topProfile.name}
              </p>
              {topProfile.email && (
                <p className="text-[12px] font-normal text-muted-foreground">
                  {topProfile.email}
                </p>
              )}
              {topProfile.title && (
                <p className="text-[12px] font-normal text-muted-foreground">
                  {topProfile.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {showFollowButton && (
              <Button variant="outline" className="flex-1">
                {followButtonText}
              </Button>
            )}
            {showConnectButton && (
              <Button
                className="bg-[#7F56D9] border-none text-white flex-1"
                variant="outline"
              >
                {connectButtonText}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Section Activity Feed - Mobile */}
        <motion.div
          className="flex gap-3 border border-gray-200 p-3 rounded-lg shadow-sm bg-white w-full"
          animate={{ y: [4, -4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="relative flex flex-col gap-3 w-fit">
            <Image
              src={bottomProfile.src}
              alt={bottomProfile.alt}
              className="rounded-full"
              width={48}
              height={48}
            />
            {bottomProfile.hasVerifiedBadge && (
              <div className="absolute bottom-2 right-0 w-4 h-4">
                <Image
                  src="/verified-tick.svg"
                  alt="Verified Tick"
                  width={16}
                  height={16}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <div className="text-[#101828] font-semibold">
                {bottomProfile.name}{" "}
              </div>
              {bottomActivity?.timestamp && (
                <span className="text-[#475467] text-xs">
                  {bottomActivity.timestamp}
                </span>
              )}
            </div>
            {bottomActivity?.message && (
              <p className="text-sm text-muted-foreground">
                {bottomActivity.message}
              </p>
            )}
          </div>
        </motion.div>

        {/* Conteneur pour le FloatingEmoji avec position relative */}
        <div className="relative h-16 w-full flex justify-center">
          <FloatingEmoji position="bottom-right" language={language} />
        </div>
      </div>
    </div>
  );
};

export default UserActivitySection;
