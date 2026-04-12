"use client";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/navbar";
import { motion, useScroll } from "framer-motion";
import React from "react";
import Image from "next/image";
import { Safari } from "@/components/magicui/safari";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import ButtonJoinWaitlist from "./ui/button-join-wailist";
import { Badge } from "./ui/badge";

const Builder = ({
  title,
  badge,
  description,
  image,
  body,
  displayJoinWaitlist = true,
}: {
  title: string | null;
  badge: string;
  description: string | null;
  image: string | null;
  body: React.ReactNode;
  displayJoinWaitlist?: boolean;
}) => {
  const t = useTranslations("nav");
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflowX = "hidden";

    const unsubscribe = scrollY.on("change", (latest) => {
      if (latest > 50 && !hasScrolled) {
        setHasScrolled(true);
      } else if (latest <= 50 && hasScrolled) {
        setHasScrolled(false);
      }
    });

    return () => {
      unsubscribe();
      document.body.style.overflowX = "";
    };
  }, [scrollY, hasScrolled]);

  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Navbar hasScrolled={hasScrolled} />
      <div className="flex flex-col items-center justify-center mt-[120px]">
        <div className="flex flex-col items-center gap-2">
          {/* <div className="text-[#5E6AD2] text-base font-semibold leading-6 text-center underline underline-offset-4">
            Social network
          </div> */}
          <Badge className="mb-3 bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 font-medium px-4 py-1.5">
            {badge}
          </Badge>
          {title && (
            <h1 className="text-[#101828] text-4xl font-bold text-center">
              {title}
            </h1>
          )}
        </div>
        {description && (
          <p className="text-base text-[#344054] text-muted-foreground text-center">
            {description}
          </p>
        )}
        {image && (
          <div className="relative mt-[64px]">
            <Safari
              url="onefive.app/signin"
              className="size-full"
              imageSrc={image}
            />
          </div>
        )}
        {displayJoinWaitlist && (
          <div className="relative mt-[64px]">
            <ButtonJoinWaitlist
              text={t("joinWaitlist")}
              withAnimation={true}
              icon={true}
            />
          </div>
        )}
      </div>
      {body}
      <Footer className="mt-[100px]" />
    </div>
  );
};

export default Builder;
