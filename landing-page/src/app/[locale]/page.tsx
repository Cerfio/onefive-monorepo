"use client";
import Image from "next/image";
import * as React from "react";
import { motion, useScroll } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RotatingBadge } from "@/components/hero/rotating-badge";
import { ParticleEffect } from "@/components/particle-effect";
import { Navbar } from "@/components/navbar";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";
import { useTheme } from "next-themes";
import Footer from "@/components/footer";
import { useTranslations } from "next-intl";
import { use } from "react";
import {
  AvailableLanguage,
  DEFAULT_LANGUAGE,
  isValidLanguage,
  Language,
} from "@/types/languages";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";
import { LazySection, useLazyComponent } from "@/components/lazy-section";
import NumberFlow from "@number-flow/react";
import FaqSection from "@/components/faq-section";

// Composants lazy loaded
const FeaturesSection = useLazyComponent(() =>
  import("@/components/sections/features-section")
);
const EcosystemSection = useLazyComponent(() =>
  import("@/components/sections/ecosystem-section")
);
const RolesSection = useLazyComponent(() =>
  import("@/components/sections/roles-section")
);
const CTASection = useLazyComponent(() =>
  import("@/components/sections/cta-section")
);
const IntegrationsSection = useLazyComponent(() =>
  import("@/components/sections/integrations-section")
);




export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const localeString = resolvedParams.locale;
  const language = isValidLanguage(localeString)
    ? localeString
    : DEFAULT_LANGUAGE;
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const { theme } = useTheme();
  const t = useTranslations("home");
  const { count, loading } = useWaitlistCount();

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
    <div className="overflow-x-hidden bg-background">
      <Navbar hasScrolled={hasScrolled} />
      <div className="flex flex-col items-center justify-center">
        {/* Tous les éléments contenus à l'intérieur */}
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {" "}
          {/* Ajout de padding responsive */}
          <div className="relative w-full h-[600px] flex items-center justify-center">
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  width: `${720 + (index - 1) * 300}px`,
                  height: `${720 + (index - 1) * 300}px`,
                }}
                animate={{
                  rotate: index % 2 === 0 ? 360 : -360,
                }}
                transition={{
                  duration: 50 + index * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-400" />
                  {index === 1 && (
                    <div className="absolute inset-0">
                      {[45, 100, 269, 353].map((angle, i) => {
                        const roles = [
                          {
                            title: "Founder",
                            color: "bg-[#007A5A]",
                            image: "/alisa-hester.png",
                          },
                          {
                            title: "VC",
                            color: "bg-[#4489B5]",
                            image: "/nicolas-wang.png",
                          },
                          {
                            title: "Mentor",
                            color: "bg-[#BF5B8D]",
                            image: "/katy-fuller.png",
                          },
                          {
                            title: "BA",
                            color: "bg-[#4489B5]",
                            image: "/jackson-reed.png",
                          },
                        ];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Image
                                src={roles[i].image}
                                alt="Avatar"
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white"
                              />
                              <Badge className={`${roles[i].color} px-2 py-1`}>
                                {roles[i].title}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}

                      {[135, 234, 300].map((angle, i) => {
                        const emojis = ["✍️", "👍", "🎉"];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Badge className="bg-white rounded-full p-2">
                              {emojis[i]}
                            </Badge>
                          </motion.div>
                        );
                      })}

                      {[200].map((angle, i) => {
                        const logos = ["/google.webp"];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 360
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center bg-white rounded-full p-2">
                              <Image
                                src={logos[i]}
                                alt="Logo"
                                width={72}
                                height={72}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {index === 2 && (
                    <div className="absolute inset-0">
                      {[20, 200].map((angle, i) => {
                        const profiles = [
                          {
                            image: "/alec-whitten.png",
                            title: "CTO",
                            color: "bg-[#5D5BBF]",
                          },
                          {
                            image: "/zaid-schwartz.png",
                            title: "Intern",
                            color: "bg-[#EA8383]",
                          },
                        ];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Image
                                src={profiles[i].image}
                                alt="Avatar"
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white"
                              />
                              <Badge
                                className={`${profiles[i].color} px-2 py-1`}
                              >
                                {profiles[i].title}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                      {[300, 420, 540].map((angle, i) => {
                        const images = [
                          {
                            image: "/notion.png",
                            width: 32,
                            height: 32,
                          },
                          {
                            image: "/figma.png",
                            width: 24,
                            height: 24,
                          },
                          {
                            image: "/airbnb.png",
                            width: 32,
                            height: 32,
                          },
                        ];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Image
                                style={{
                                  objectFit: "contain",
                                }}
                                src={images[i].image}
                                alt="Avatar"
                                width={images[i].width}
                                height={images[i].height}
                                className="border-2 border-white bg-white"
                              />
                            </div>
                          </motion.div>
                        );
                      })}

                      {[90, 210, 330, 450].map((angle, i) => {
                        const emojis = ["💡", "📈", "🎯", "📋"];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Badge className="bg-white rounded-full p-2">
                              {emojis[i]}
                            </Badge>
                          </motion.div>
                        );
                      })}

                      {[45, 165, 260].map((angle, i) => {
                        const flags = ["🇫🇷", "🇺🇸", "🇬🇧"];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Badge className="bg-white rounded-full p-2 text-xl">
                              {flags[i]}
                            </Badge>
                          </motion.div>
                        );
                      })}

                      {[135, 234, 340].map((angle, i) => {
                        const hashtags = [
                          { name: "#studio", color: "bg-[#3E4784]" },
                          { name: "#incubator", color: "bg-[#6938EF]" },
                          { name: "#accelerator", color: "bg-[#83A4F7]" },
                          { name: "#contest", color: "bg-[#E31B54]" },
                        ];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 510
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Badge
                              className={`${hashtags[i].color} px-2 py-1 rounded-full`}
                            >
                              {hashtags[i].name}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {index === 3 && (
                    <div className="absolute inset-0">
                      {[0, 115, 260, 50, 180, 320, 223].map((angle, i) => {
                        const logos = [
                          {
                            logo: "/onefive.svg",
                            width: 32,
                            height: 32,
                          },
                          {
                            logo: "/stationf.webp",
                            width: 48,
                            height: 48,
                          },
                          {
                            logo: "/bpi-france.png",
                            width: 48,
                            height: 48,
                          },
                          {
                            logo: "/french-tech.webp",
                            width: 40,
                            height: 40,
                          },
                          {
                            logo: "/y-combinator.webp",
                            width: 88,
                            height: 88,
                          },
                          {
                            logo: "/the-family.png",
                            width: 44,
                            height: 44,
                          },
                          {
                            logo: "/stripe.png",
                            width: 32,
                            height: 32,
                          },
                        ];
                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              x: `calc(${
                                Math.cos((angle * Math.PI) / 180) * 660
                              }px - 50%)`,
                              y: `calc(${
                                Math.sin((angle * Math.PI) / 180) * 660
                              }px - 50%)`,
                            }}
                            animate={{
                              rotate: index % 2 === 0 ? -360 : 360,
                            }}
                            transition={{
                              duration: 50 + index * 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center bg-white rounded-full p-2">
                              <Image
                                src={logos[i].logo}
                                alt="Logo"
                                width={logos[i].width}
                                height={logos[i].height}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-2xl text-center flex flex-col items-center p-12">
                <RotatingBadge
                  slides={[
                    { key: "brand", text: "Onefive social network" },
                    { key: "audience", text: "Built for founders" },
                    { key: "product", text: "Atlas · Dataroom · Spotlight" },
                  ]}
                />
                <div className="relative overflow-hidden">
                  <ParticleEffect />
                  <motion.h1
                    className="text-4xl font-bold leading-tight mb-6 mt-12 bg-gradient-to-r from-[#5E6AD2] to-[#F35C47] text-transparent bg-clip-text relative z-10 w-full"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.43, 0.13, 0.23, 0.96],
                      opacity: { duration: 1 },
                    }}
                  >
                    {t("title")}
                  </motion.h1>
                </div>
                <p className="text-lg text-[#344054] text-muted-foreground mb-8 whitespace-pre-line">
                  {t("description")}
                </p>
                <div className="flex flex-col items-center gap-2 mb-8">
                  <p className="text-sm text-[#667085] font-medium">
                    {t.rich("joinMoreThanFounders", {
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
                              value={count}
                              format={{ useGrouping: true }}
                              transformTiming={{ duration: 750, easing: "ease-out" }}
                            />
                          </span>
                        </span>
                      ),
                    })}
                  </p>
                  <ButtonJoinWaitlist text={t("joinWaitlist")} icon={true} />
                </div>
                {/* Names the logos orbiting the hero (Station F, BPI, French
                    Tech, Y Combinator, The Family, Stripe). Unlabelled, a ring
                    of well-known marks reads as backing or partnership; none of
                    them are. This says the only true thing: it is the world the
                    product is for. */}
                <p className="text-xs text-[#98A2B3]">
                  {t("ecosystemOrbitLabel")}
                </p>
              </div>
            </div>
          </div>
          <LazySection rootMargin="100px">
            <FeaturesSection language={language as AvailableLanguage} />
          </LazySection>
                </div>
        <LazySection rootMargin="100px">
          <EcosystemSection />
        </LazySection>

        <LazySection rootMargin="100px">
          <RolesSection />
        </LazySection>

        <LazySection rootMargin="100px">
          <CTASection />
        </LazySection>

        <LazySection rootMargin="100px">
          <IntegrationsSection />
        </LazySection>
      </div>
      <FaqSection locale={language} />
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
