"use client";

import { useTranslations } from "next-intl";
import { AvailableLanguage } from "@/types/languages";
import FeatureSection from "@/components/feature-section";
import UserActivitySection from "@/components/user-activity-section";
import CommunityProfilesDisplay from "@/components/community-profiles-display";
import { communityProfiles } from "@/data/communityProfiles";
import DiscussionInterface from "@/components/discussion-interface";
import MethodologyInterface from "@/components/methodology-interface";
import InvestmentInterface from "@/components/investment-interface";
import DataroomInterface from "@/components/dataroom-interface";

interface FeaturesSectionProps {
  language: AvailableLanguage;
}

export default function FeaturesSection({ language }: FeaturesSectionProps) {
  const t = useTranslations("home");

  return (
    <div className="mt-[500px] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-center">
        {t("toolsDesignedForEntrepreneurs")}
      </h1>
      <p className="text-lg text-[#344054] text-muted-foreground mt-2 mb-8 text-center">
        {t("toolsDesignedForEntrepreneursDescription")}
      </p>

      <div className="flex flex-col items-center gap-16">
        <FeatureSection
          title={t("socialNetwork")}
          description={t("socialNetworkDescription")}
          linkHref="/social-network"
          linkText={t("discoverNetwork")}
          linkEnabled={true}
          reverseLayout={false}
        >
          <UserActivitySection
            language={language}
            topProfile={{
              src: "/franklin-mays.jpg",
              alt: "Franklin Mays",
              name: "Yannis Coulibaly",
              email: "yannis@onefive.fr",
              hasOnlineIndicator: true,
            }}
            bottomProfile={{
              src: "/kelly-williams.png",
              alt: "Kelly Williams",
              name: "Kelly Williams",
              hasVerifiedBadge: true,
            }}
            bottomActivity={{
              timestamp: t("6HoursAgo"),
              message: (
                <>
                  {t.rich("invitedToTeam", {
                    name: "Lana Steiner",
                    team: "green-got",
                    b: (chunks) => (
                      <b className="text-[#6941C6]">{chunks}</b>
                    ),
                  })}
                </>
              ),
            }}
          />
        </FeatureSection>

        <FeatureSection
          title={t("community")}
          description={t("communityDescription")}
          linkHref="/community"
          linkText={t("joinCommunity")}
          linkEnabled={true}
          reverseLayout={true}
          className="mt-48 lg:mt-0"
        >
          <CommunityProfilesDisplay profiles={communityProfiles} />
        </FeatureSection>

        <FeatureSection
          title={t("discussion")}
          description={t("discussionDescription")}
          linkHref="/community"
          linkText={t("startDiscussing")}
          linkEnabled={true}
          className="mt-32 lg:mt-0"
        >
          <DiscussionInterface />
        </FeatureSection>

        <FeatureSection
          title={t("dataroom")}
          description={t("dataroomDescription")}
          linkHref="/dataroom"
          linkText={t("exploreDataroom")}
          linkEnabled={true}
          reverseLayout={true}
          className="mt-[500px] lg:mt-0"
        >
          <DataroomInterface />
        </FeatureSection>

        <FeatureSection
          title={t("spotlight")}
          description={t("spotlightDescription")}
          linkText={t("comingSoon")}
          linkEnabled={false}
          className="mt-[400px] lg:mt-0"
        >
          <div className="relative p-4 h-[400px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <MapStyle />
          </div>
        </FeatureSection>

        <FeatureSection
          title={t("methodology")}
          description={t("methodologyDescription")}
          linkText={t("comingSoon")}
          linkEnabled={false}
          reverseLayout={true}
          className="mt-32 lg:mt-0"
        >
          <MethodologyInterface />
        </FeatureSection>

        <FeatureSection
          title={t("investment")}
          description={t("investmentDescription")}
          linkText={t("comingSoon")}
          linkEnabled={false}
          className="mt-[240px] lg:mt-0"
        >
          <InvestmentInterface />
        </FeatureSection>
      </div>
    </div>
  );
}

// Import dynamique pour éviter les problèmes de build
import dynamic from 'next/dynamic';

const MapStyle = dynamic(() => import("@/components/map-style").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
});
