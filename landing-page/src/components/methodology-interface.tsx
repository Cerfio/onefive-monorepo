"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AchievementCard } from "./achievement-card";
import { MessageCard } from "./message-card";

interface MethodologyInterfaceProps {
  videoProps?: {
    imageSrc: string;
    imageAlt: string;
    playButtonSrc: string;
  };
  messageProps?: {
    avatarSrc: string;
    avatarAlt: string;
    name: string;
    timestamp: string;
    message: string;
  };
  pdfProps?: {
    fileName: string;
    progress: number;
  };
  achievementProps?: {
    message: string;
  };
  progressIndicator?: {
    value: string;
    iconSrc: string;
  };
  chartProps?: {
    chartSrc: string;
  };
}

export default function MethodologyInterface({
  videoProps = {
    imageSrc: "/woman-video.jpeg",
    imageAlt: "Isobel Fuller",
    playButtonSrc: "/play-button.png",
  },
  messageProps = {
    avatarSrc: "/isobel-fuller.jpg",
    avatarAlt: "Katherine Moss Advocate",
    name: "Katherine Moss 👩‍⚖️",
    timestamp: "2 mins ago",
    message: "Je viens de terminer de review vos termes juridique !",
  },
  pdfProps = {
    fileName: "Template-Pitch-Deck.pdf",
    progress: 100,
  },
  achievementProps = {
    message: 'Félicitations, cours terminé "Rendre son entreprise scalable" 🧠',
  },
  progressIndicator = {
    value: "100%",
    iconSrc: "/arrow-up.png",
  },
  chartProps = {
    chartSrc: "/chart.svg",
  },
}: MethodologyInterfaceProps) {
  return (
    <div className="relative p-4 bg-white rounded-xl overflow-hidden">
      {/* Desktop/Tablet layout */}
      <div className="hidden sm:block relative h-[400px]">
        {/* Video Card */}
        <motion.div
          className="relative w-fit absolute left-0 top-0"
          animate={{ y: [-5, 5] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <Image
            src={videoProps.imageSrc}
            alt={videoProps.imageAlt}
            width={187}
            height={153}
            className="rounded-lg border-[#007A5A]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={videoProps.playButtonSrc}
              alt="Play button"
              width={56}
              height={56}
              className="rounded-lg"
            />
          </div>
        </motion.div>

        {/* Message Card */}
        <motion.div
          className="flex flex-col gap-2 absolute top-32 right-20"
          animate={{ y: [2, 0, -2] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          <MessageCard
            avatarSrc={messageProps.avatarSrc}
            avatarAlt={messageProps.avatarAlt}
            name={messageProps.name}
            timestamp={messageProps.timestamp}
            message={messageProps.message}
          />
        </motion.div>

        {/* Pitch Deck PDF Card */}
        <motion.div
          className="absolute z-10 top-56 left-0 bg-white rounded-lg shadow-sm border border-gray-200 p-3"
          animate={{ y: [-6, 6] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.7,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="bg-[#7F56D9] bg-opacity-10 p-2 rounded">
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V6L10 0Z"
                  fill="#7F56D9"
                  fillOpacity="0.2"
                />
                <path
                  d="M10 0V4C10 5.1 10.9 6 12 6H16L10 0Z"
                  fill="#7F56D9"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="text-sm font-medium">
                {pdfProps.fileName}
              </div>
              <div className="w-full rounded-full h-1.5 mt-2 flex items-center gap-2">
                <div
                  className="bg-[#7F56D9] h-1.5 rounded-full"
                  style={{ width: `${pdfProps.progress}%` }}
                />
                <div className="text-xs text-gray-500">{pdfProps.progress}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Card */}
        <motion.div
          className="absolute bottom-20 left-20"
          animate={{ y: [5, -5] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <AchievementCard message={achievementProps.message} />
        </motion.div>

        {/* 100% Indicator */}
        <motion.div
          className="absolute top-48 left-8 hidden md:block"
          animate={{ y: [-5, 5] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="flex items-center gap-1 px-[10px] py-[2px] pl-2 rounded-2xl bg-[#ECFDF3] mix-blend-multiply w-fit h-fit">
            <Image
              src={progressIndicator.iconSrc}
              alt="Arrow up"
              width={12}
              height={12}
            />
            <p className="text-sm text-[#027A48] text-center font-medium leading-5">
              {progressIndicator.value}
            </p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="absolute top-[80px] left-[280px]"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={chartProps.chartSrc}
            alt="Progress Chart"
            width={84}
            height={84}
          />
        </motion.div>
      </div>

      {/* Mobile layout (phones only) - Column stack */}
      <div className="flex flex-col items-center gap-4 sm:hidden w-full">
        {/* Video Card */}
        <motion.div
          className="relative w-full max-w-xs"
          animate={{ y: [-3, 3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            <Image
              src={videoProps.imageSrc}
              alt={videoProps.imageAlt}
              width={320}
              height={180}
              className="rounded-lg border-[#007A5A] w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={videoProps.playButtonSrc}
                alt="Play button"
                width={56}
                height={56}
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="w-full max-w-xs md:flex justify-center hidden"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={chartProps.chartSrc}
            alt="Progress Chart"
            width={84}
            height={84}
          />
        </motion.div>

        {/* Message Card */}
        <motion.div
          className="w-full max-w-xs"
          animate={{ y: [2, -2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <MessageCard
            avatarSrc={messageProps.avatarSrc}
            avatarAlt={messageProps.avatarAlt}
            name={messageProps.name}
            timestamp={messageProps.timestamp}
            message={messageProps.message}
          />
        </motion.div>

        {/* Pitch Deck PDF Card */}
        <motion.div
          className="w-full max-w-xs bg-white rounded-lg shadow-sm border border-gray-200 p-3"
          animate={{ y: [-3, 3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="bg-[#7F56D9] bg-opacity-10 p-2 rounded">
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V6L10 0Z"
                  fill="#7F56D9"
                  fillOpacity="0.2"
                />
                <path
                  d="M10 0V4C10 5.1 10.9 6 12 6H16L10 0Z"
                  fill="#7F56D9"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="text-sm font-medium">
                {pdfProps.fileName}
              </div>
              <div className="w-full rounded-full h-1.5 mt-2 flex items-center gap-2">
                <div
                  className="bg-[#7F56D9] h-1.5 rounded-full"
                  style={{ width: `${pdfProps.progress}%` }}
                />
                <div className="text-xs text-gray-500">{pdfProps.progress}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Card */}
        <motion.div
          className="w-full max-w-xs"
          animate={{ y: [3, -3] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <AchievementCard message={achievementProps.message} />
        </motion.div>

        {/* 100% Indicator */}
        <motion.div
          className="w-full max-w-xs md:flex justify-center hidden"
          animate={{ y: [-3, 3] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-1 px-[10px] py-[2px] pl-2 rounded-2xl bg-[#ECFDF3] mix-blend-multiply w-fit h-fit">
            <Image
              src={progressIndicator.iconSrc}
              alt="Arrow up"
              width={12}
              height={12}
            />
            <p className="text-sm text-[#027A48] text-center font-medium leading-5">
              {progressIndicator.value}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 