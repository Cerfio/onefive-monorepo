"use client";
import Image from "next/image";
import * as React from "react";
import { motion, useScroll } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RotatingBadge } from "@/components/hero/rotating-badge";
import { ParticleEffect } from "@/components/particle-effect";
import { Navbar } from "@/components/navbar";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";
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

// One treatment for every mark in the orbit, whatever its shape. The hero used
// to render logos three different ways — Google bare at 72px, Notion/Figma/
// Airbnb in square white boxes, the rest as round pills — which is what made
// the ring read as clip art rather than a set. Here they all sit in the same
// white stadium, sized by height so a wordmark and a square glyph carry equal
// optical weight. bg-white stays in dark mode on purpose: these are dark-on-
// transparent marks and need a light field to stay legible.
function OrbitLogo({
  src,
  width,
  height,
  size,
}: {
  src: string;
  width: number;
  height: number;
  size: string;
}) {
  return (
    <div className="flex items-center justify-center rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        className={`${size} w-auto object-contain`}
      />
    </div>
  );
}

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
            {[1, 2, 3].map((index) => {
              // The ring turns and every item on it counter-turns by the same
              // amount, so faces and wordmarks stay upright. Both are CSS
              // animations rather than Framer values: two dozen infinite
              // rotations is a lot of rAF work for motion that never varies,
              // and `rotate` is a compositor property. The item's translate and
              // the spin sit on separate elements because `rotate` is applied
              // before `transform` — on one element the offset would swing
              // around the centre instead of holding its place on the ring.
              const duration = `${50 + index * 2}s`;
              const ringSpin =
                index % 2 === 0 ? "orbit-rotate-cw" : "orbit-rotate-ccw";
              const itemSpin =
                index % 2 === 0 ? "orbit-rotate-ccw" : "orbit-rotate-cw";
              const radius = 360 + (index - 1) * 150;
              const place = (angle: number) => ({
                transform: `translate(calc(${(
                  Math.cos((angle * Math.PI) / 180) * radius
                ).toFixed(2)}px - 50%), calc(${(
                  Math.sin((angle * Math.PI) / 180) * radius
                ).toFixed(2)}px - 50%))`,
              });

              return (
                <div
                  key={index}
                  className={`absolute ${ringSpin}`}
                  style={{
                    width: `${720 + (index - 1) * 300}px`,
                    height: `${720 + (index - 1) * 300}px`,
                    ["--orbit-duration" as string]: duration,
                  }}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-400 dark:border-gray-600" />
                    {index === 1 && (
                      <div className="absolute inset-0">
                        {/* Angles are spread evenly around each ring rather than
                            clustered. They used to bunch up, which is why one
                            half of the orbit looked crowded while the other read
                            as empty at the same instant. */}
                        {[20, 122, 225, 328].map((angle, i) => {
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
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <Image
                                    src={roles[i].image}
                                    alt="Avatar"
                                    width={48}
                                    height={48}
                                    className="rounded-full border-2 border-white dark:border-gray-800"
                                  />
                                  <Badge
                                    className={`${roles[i].color} px-2 py-1`}
                                  >
                                    {roles[i].title}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {[173, 276].map((angle, i) => {
                          const emojis = ["✍️", "🎉"];
                          return (
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <Badge className="bg-white dark:bg-gray-800 rounded-full p-2">
                                  {emojis[i]}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}

                        <div
                          className="absolute left-1/2 top-1/2"
                          style={place(71)}
                        >
                          <div
                            className={itemSpin}
                            style={{ ["--orbit-duration" as string]: duration }}
                          >
                            <OrbitLogo
                              src="/google.webp"
                              width={640}
                              height={217}
                              size="h-6"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="absolute inset-0">
                        {[15, 195].map((angle, i) => {
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
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <Image
                                    src={profiles[i].image}
                                    alt="Avatar"
                                    width={48}
                                    height={48}
                                    className="rounded-full border-2 border-white dark:border-gray-800"
                                  />
                                  <Badge
                                    className={`${profiles[i].color} px-2 py-1`}
                                  >
                                    {profiles[i].title}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {[87, 159, 303].map((angle, i) => {
                          const tools = [
                            { image: "/notion.png", width: 512, height: 512, size: "h-7" },
                            { image: "/figma.png", width: 1200, height: 1800, size: "h-7" },
                            { image: "/airbnb.png", width: 512, height: 512, size: "h-7" },
                          ];
                          return (
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <OrbitLogo
                                  src={tools[i].image}
                                  width={tools[i].width}
                                  height={tools[i].height}
                                  size={tools[i].size}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {[51, 267].map((angle, i) => {
                          const emojis = ["💡", "📈"];
                          return (
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <Badge className="bg-white dark:bg-gray-800 rounded-full p-2">
                                  {emojis[i]}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}

                        {/* Three hashtags, three angles. There used to be a
                            fourth entry, #contest, that no angle ever reached —
                            it has never rendered. */}
                        {[123, 231, 339].map((angle, i) => {
                          const hashtags = [
                            { name: "#studio", color: "bg-[#3E4784]" },
                            { name: "#incubator", color: "bg-[#6938EF]" },
                            { name: "#accelerator", color: "bg-[#83A4F7]" },
                          ];
                          return (
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <Badge
                                  className={`${hashtags[i].color} px-2 py-1 rounded-full`}
                                >
                                  {hashtags[i].name}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {index === 3 && (
                      <div className="absolute inset-0">
                        {[0, 51, 103, 154, 206, 257, 309].map((angle, i) => {
                          const logos = [
                            { logo: "/onefive.svg", width: 32, height: 32, size: "h-7" },
                            { logo: "/stationf.webp", width: 1024, height: 512, size: "h-6" },
                            { logo: "/bpi-france.png", width: 959, height: 972, size: "h-8" },
                            { logo: "/french-tech.webp", width: 512, height: 512, size: "h-8" },
                            { logo: "/y-combinator.webp", width: 512, height: 256, size: "h-6" },
                            { logo: "/the-family.png", width: 700, height: 838, size: "h-8" },
                            { logo: "/stripe.png", width: 3840, height: 2160, size: "h-6" },
                          ];
                          return (
                            <div
                              key={i}
                              className="absolute left-1/2 top-1/2"
                              style={place(angle)}
                            >
                              <div
                                className={itemSpin}
                                style={{
                                  ["--orbit-duration" as string]: duration,
                                }}
                              >
                                <OrbitLogo
                                  src={logos[i].logo}
                                  width={logos[i].width}
                                  height={logos[i].height}
                                  size={logos[i].size}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
