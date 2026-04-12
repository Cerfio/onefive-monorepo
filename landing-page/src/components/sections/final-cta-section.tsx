"use client";

import { Button } from "@/components/ui/button";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

export default function FinalCTASection() {
  const t = useTranslations("home");

  return (
    <div className="mt-[120px] sm:mt-[150px] mb-[150px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <p className="text-[#667085] text-center mb-4 font-medium">
        {t("networkingDatasharingInvestment")}
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-4 max-w-3xl mx-auto">
        {t("theFutureOfEntrepreneurshipStartsHere")}
      </h1>
      <p className="text-base sm:text-lg text-[#667085] text-center mb-8 max-w-xl mx-auto">
        {t(
          "meetInvestorsGetTailoredMentorshipConnectWithIndustryExpertsAllOnOnePlatformBuiltForEuropeanEntrepreneurs"
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <ButtonJoinWaitlist text={t("joinWaitlist")} />
        <Button variant="outline" size="lg">
          <LinkedInLogoIcon className="mr-2 h-4 w-4" />
          {t("signUpWithLinkedIn")}
        </Button>
      </div>
    </div>
  );
}

