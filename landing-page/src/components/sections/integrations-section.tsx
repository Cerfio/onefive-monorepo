"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

const Test = () => {
  return (
    <Image src="/product-hunt.png" alt="Product Hunt" width={32} height={32} />
  );
};

const Test2 = () => {
  return (
    <Image
      className="rounded border bg-white"
      src="/linkedin.png"
      alt="Linkedin"
      width={32}
      height={32}
    />
  );
};

const Test3 = () => {
  return (
    <Image
      className="rounded border"
      src="/crunchbase.jpg"
      alt="Crunchbase"
      width={32}
      height={32}
    />
  );
};

const Test4 = () => {
  return (
    <Image
      className="rounded"
      src="/eventbrite.png"
      alt="Eventbrite"
      width={32}
      height={32}
    />
  );
};

const featuresa = [
  {
    Icon: Test,
    name: "Product Hunt",
    description: "Showcase your startup and gain traction.",
    href: "/",
    cta: "Learn more",
    background: <div className="absolute bg-white w-full h-full" />,
    className: "col-span-1",
  },
  {
    Icon: Test2,
    name: "LinkedIn",
    description: "Sync your network and professional profile.",
    href: "/",
    cta: "Learn more",
    background: <div className="absolute bg-white w-full h-full" />,
    className: "col-span-1",
  },
  {
    Icon: Test3,
    name: "Crunchbase",
    description: "Sync your company data for better visibility.",
    href: "/",
    cta: "Learn more",
    background: <div className="absolute bg-white w-full h-full" />,
    className: "col-span-1",
  },
  {
    Icon: Test4,
    name: "Eventbrite",
    description: "Find and join top startup events easily.",
    href: "/",
    cta: "Learn more",
    background: <div className="absolute bg-white w-full h-full" />,
    className: "col-span-1",
  },
];

export default function IntegrationsSection() {
  const t = useTranslations("home");

  return (
    <div className="mt-[80px] sm:mt-[120px] flex flex-col items-center justify-center px-4 sm:px-6">
      <h1 className="text-2xl sm:text-4xl font-bold text-center">
        {t("onefiveConnectsWithTheBestStartupPlatforms")}
      </h1>
      <p className="text-base sm:text-lg text-[#344054] text-muted-foreground mb-8 text-center pt-4 max-w-2xl mx-auto">
        {t(
          "seamlesslyIntegrateWithTopPlatformsToEnhanceYourStartupExperience"
        )}
      </p>

      <BentoGrid className="grid-cols-1 sm:grid-cols-2 sm:grid-rows-2">
        {featuresa.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

