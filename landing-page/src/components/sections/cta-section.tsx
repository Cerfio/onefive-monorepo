"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";
import NumberFlow from "@number-flow/react";

export default function CTASection() {
  const t = useTranslations("home");
  const { count, loading } = useWaitlistCount();

  return (
    <div className="flex flex-col items-center justify-center max-w-7xl mt-20 w-full px-4 sm:px-6">
      <div className="bg-[#F9FAFB] rounded-2xl w-full p-6 sm:p-10">
        <div className="text-[#101828] text-center text-2xl sm:text-3xl md:text-[36px] font-semibold leading-tight sm:leading-[44px] tracking-[-0.72px]">
          {t("joinUsToday")}
          <br /> {t("futureOfEntrepreneurshipStartsHere")}
        </div>
        <div className="text-base sm:text-lg text-[#344054] text-muted-foreground mb-8 text-center pt-4">
          {t.rich("joinMoreThan4000Founders", {
            animated: () => (
              <span className="relative inline-block min-w-[3ch]">
                {loading && (
                  <span
                    className="absolute inset-0 animate-pulse bg-[#667085]/20 rounded"
                    aria-hidden
                  />
                )}
                <span className={loading ? "invisible" : ""}>
                  <NumberFlow
                    value={count ?? 0}
                    format={{ useGrouping: true }}
                    transformTiming={{ duration: 750, easing: "ease-out" }}
                  />
                </span>
              </span>
            ),
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            {t("aboutUs")}
          </Button>
          <ButtonJoinWaitlist text={t("joinWaitlist")} />
        </div>
      </div>
    </div>
  );
}

