"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useScroll } from "framer-motion";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";
import {
  Check,
  HelpCircle,
} from "lucide-react";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const PricingPage = () => {
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");
  const { formattedCount } = useWaitlistCount();
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      if (latest > 50 && !hasScrolled) {
        setHasScrolled(true);
      } else if (latest <= 50 && hasScrolled) {
        setHasScrolled(false);
      }
    });
    return () => unsubscribe();
  }, [scrollY, hasScrolled]);

  // FAQ
  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFD] overflow-x-hidden">
      <Navbar hasScrolled={hasScrolled} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-[120px] pb-16">
        {/* Hero - aligned with nav messaging */}
        <div className="w-full flex flex-col items-center justify-center mb-20">
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
            <Badge className="mb-4 bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 font-medium px-4 py-1.5">
              {tNav("pricing")}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#F35C47]">
              {tNav("freeForNow")}
            </h1>
            <p className="text-base sm:text-lg text-[#344054] max-w-xl">
              {tNav("takeAdvantage")}
            </p>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t("whyChooseOnefive")}
            </h2>
            <p className="text-lg text-[#344054] text-muted-foreground">
              {t("whyChooseDesc")}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-xl">
                {t("featureComparison")}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-500">
                      {t("feature")}
                    </th>
                    <th className="p-4 text-center font-medium text-gray-500">
                      {t("onefive")}
                    </th>
                    <th className="p-4 text-center font-medium text-gray-500">
                      {t("otherPlatforms")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">
                      {t("completeEcosystem")}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400">{t("limited")}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">
                      {t("entrepreneurCommunity")}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400">{t("partial")}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">
                      {t("methodologicalTools")}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400">{t("basic")}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-gray-700">
                      {t("fundingResources")}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400">{t("limited")}</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700">
                      {t("multipleIntegrations")}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400">{t("minimal")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-28 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("faqTitle")}</h2>
            <p className="text-lg text-[#344054] text-muted-foreground">
              {t("faqSubtitle")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-3 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#5E6AD2] shrink-0 mt-1" />
                  {faq.question}
                </h3>
                <p className="text-gray-700 pl-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 bg-[#F9FAFB] rounded-2xl p-10 text-center">
          <h2 className="text-[36px] font-semibold leading-[44px] tracking-[-0.72px] text-[#101828] mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-lg text-[#344054] text-muted-foreground mb-8">
            {t("ctaSubtitle", { count: formattedCount ?? "..." })}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="lg">
              {t("learnMore")}
            </Button>
            <ButtonJoinWaitlist text={tNav("joinWaitlist")} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingPage;
