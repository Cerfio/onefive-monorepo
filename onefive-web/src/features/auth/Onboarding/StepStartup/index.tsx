"use client";

import { useOnboardingContext } from "../OnboardingContext";
import { useStartupSuggestions } from "@/hooks/useFeedExtra";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  cardVariants,
  enhancedCardVariants,
  enhancedContainerVariants,
} from "../constant";
import Image, { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/base/card/card";
import { UserCheck, Users } from "lucide-react";
import { Badge } from '@/components/base/badges/badges';
import { Flag } from "@/components/ui/flag";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { Button } from "@/components/base/buttons/button";

const StepStartupList = () => {
  const t = useTranslations("onboarding.startupList");
  const { setButtonDisabled, setStartupsFollowed, startupsFollowed } =
    useOnboardingContext();

  const { data: suggestions, isLoading } = useStartupSuggestions(8, 0);

  const startups = (suggestions ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    tags: s.categories ?? [],
    // Logo réel renvoyé par l'API (peut être absent -> fallback initiale dans la carte)
    logo: s.logo ?? null,
    subtitle: s.tagline || s.description || s.categories?.[0] || "Startup",
    location: s.city ?? "",
    countryCode: s.countryCode ?? "",
    industry: s.categories?.[0],
    stage: undefined as string | undefined,
    intention: undefined as string | undefined,
  }));

  useEffect(() => {
    // Toujours permettre de continuer, même sans suivre de startups (skip optionnel)
    setButtonDisabled(false);
  }, [setButtonDisabled]);

  const callback = useCallback(
    (startupId: string, isFollow: boolean) => {
      if (isFollow) {
        toast.success("Startup ajoutée à votre feed !");
      } else {
        toast.info("Startup retirée de votre feed");
      }
      if (isFollow) {
        setStartupsFollowed((prev) => [...prev, startupId]);
      } else {
        setStartupsFollowed((prev) => prev.filter((id) => id !== startupId));
      }
    },
    [setStartupsFollowed]
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          {t("title")}
        </h2>
        <p className="text-sm sm:text-base text-[#475467] px-2">
          {t("description")}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>Suivi</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            {startupsFollowed.length}/8 startup
            {startupsFollowed.length > 1 ? "s" : ""} sélectionnée
            {startupsFollowed.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 max-w-md mx-auto px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#5E6AD2] h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${(startupsFollowed.length / 8) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {startupsFollowed.length < 2 ? (
              <span className="text-orange-600">
                Il vous faut encore {2 - startupsFollowed.length} startup
                {2 - startupsFollowed.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-green-600">
                Parfait ! Vous pouvez continuer
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        variants={enhancedContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
      >
        <AnimatePresence mode="wait">
          {isLoading
            ? // Skeleton loading
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  variants={enhancedCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <StartupCardSkeleton />
                </motion.div>
              ))
            : // Actual startups
              startups.map((startup, _index) => (
                <motion.div
                  key={startup.id}
                  variants={enhancedCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <StartupCard
                    isFollow={startupsFollowed.includes(startup.id)}
                    startup={startup}
                    callback={callback}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default StepStartupList;

const StartupCard = ({
  isFollow,
  callback,
  startup,
}: {
  isFollow: boolean;
  callback: (startupId: string, isFollow: boolean) => void;
  startup: {
    id: string;
    name: string;
    tags: string[];
    logo: string | StaticImageData | null;
    subtitle: string;
    intention?: string;
    location: string;
    countryCode: string;
    stage?: string;
    industry?: string;
  };
}) => {
  const t = useTranslations("onboarding.startupCard");

  // Mapper les intentions aux configurations
  const getIntentionConfig = (intention: string) => {
    const configs = {
      fundraising: { text: t("intention.fundraising"), color: "text-purple-600" },
      hiring: { text: t("intention.hiring"), color: "text-green-600" },
      cofounder: { text: t("intention.cofounder"), color: "text-blue-600" },
    };
    return configs[intention as keyof typeof configs] || configs.fundraising;
  };

  const intentionConfig = startup.intention
    ? getIntentionConfig(startup.intention)
    : null;

  return (
    <motion.div
      variants={cardVariants}
      layout="position"
      animate={isFollow ? "selected" : "visible"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full group hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-xl hover:shadow-[#5E6AD2]/10 cursor-pointer relative overflow-hidden flex flex-col">
        <CardContent className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {startup.logo ? (
              <Image
                src={startup.logo}
                alt={startup.name}
                width={64}
                height={64}
                className="rounded-lg mb-4 ring-2 ring-transparent group-hover:ring-green-500/20 transition-all duration-300"
              />
            ) : (
              <div
                aria-hidden
                className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center bg-[#5E6AD2]/10 text-[#5E6AD2] text-xl font-bold ring-2 ring-transparent group-hover:ring-green-500/20 transition-all duration-300"
              >
                {startup.name?.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </motion.div>

          <div className="mb-2">
            <h3 className="font-semibold text-lg text-[#101828] mb-1 group-hover:text-green-600 transition-colors">
              {startup.name}
            </h3>
            <p className="text-sm text-[#475467]">{startup.subtitle}</p>
          </div>

          {intentionConfig && (
            <div className="mb-4">
              <button
                className={`flex items-center gap-1.5 hover:underline ${intentionConfig.color} text-xs`}
              >
                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{intentionConfig.text}</span>
              </button>
            </div>
          )}

          {(startup.stage || startup.industry) && (
            <div className="flex gap-2 mb-4">
              {startup.stage && (
                <Badge
                  type="pill-color"
                  color="gray"
                  size="sm"
                  className="group-hover:border-green-500/50 transition-colors"
                >
                  {startup.stage}
                </Badge>
              )}
              {startup.industry && (
                <Badge
                  type="pill-color"
                  color="gray"
                  size="sm"
                  className="group-hover:border-green-500/50 transition-colors"
                >
                  {startup.industry}
                </Badge>
              )}
            </div>
          )}

          <div className="flex-1"></div>

          <div className="flex items-center gap-2 text-xs text-[#475467] mb-3">
            <Flag countryCode={startup.countryCode} width={16} height={12} />
            <span>{startup.location}</span>
          </div>

          <div className="w-full">
            <Tooltip
              delay={200}
              title={t("followTooltip")}
            >
              <Button
                size="sm"
                color={isFollow ? "primary" : "tertiary"}
                className="text-xs gap-1 py-1 px-2 w-full"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  callback(startup.id, !isFollow);
                }}
                aria-label={t("followAria", { name: startup.name })}
                aria-pressed={isFollow}
                iconLeading={<UserCheck data-icon />}
              >
                {isFollow ? t("following") : t("follow")}
              </Button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StartupCardSkeleton = () => (
  <div className="animate-pulse">
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-3 bg-gray-200 rounded mb-4"></div>
        <div className="w-20 h-3 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-3 bg-gray-200 rounded mb-3"></div>
        <div className="w-full h-8 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  </div>
);
