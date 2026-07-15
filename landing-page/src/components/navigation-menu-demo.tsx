"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";
import Image from "next/image";
import { Badge } from "./ui/badge";
import {
  BookOpen,
  Users,
  Calendar,
  Download,
  Clock,
  Circle,
  Rocket,
  FileText,
  ArrowRight,
  Briefcase,
  Newspaper,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useNavbarArticles } from "@/contexts/NavbarArticlesContext";
import { useLocale, useTranslations } from "next-intl";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    logo?: {
      src: string;
      alt: string;
    };
    icon?: React.ReactNode;
  }
>(({ className, title, children, logo, icon, ...props }, ref) => {
  const locale = useLocale();
  const href = props.href;
  const resolvedHref =
    href && href.startsWith("/") ? `/${locale}${href === "/" ? "" : href}` : href;

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={resolvedHref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
          {logo && (
            <div className="border border-gray-200 rounded-md p-2">
              <Image src={logo.src} alt={logo.alt} width={16} height={16} />
            </div>
          )}
          {icon && icon}
        </a>
      </NavigationMenuLink>
    </li>
  );
});

const SocialLink = ({
  icon,
  platform,
  handle,
  href,
  color,
}: {
  icon: string;
  platform: string;
  handle: string;
  href: string;
  color: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 group transition-colors duration-200"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div
      className="relative rounded-lg p-2"
      style={{ backgroundColor: `${color}15` }}
    >
      <Image
        src={icon}
        alt={platform}
        width={18}
        height={18}
        className="group-hover:scale-110 transition-transform"
      />
      <span className="sr-only">{platform}</span>
    </div>
    <div>
      <div className="font-medium text-sm group-hover:text-[#5E6AD2] transition-colors">
        {platform}
      </div>
      <div className="text-xs text-muted-foreground">{handle}</div>
    </div>
  </Link>
);

// Composant pour les éléments du menu mobile
const MobileMenuItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const locale = useLocale();
  const resolvedHref = href.startsWith("/")
    ? `/${locale}${href === "/" ? "" : href}`
    : href;

  return (
    <Link
      href={resolvedHref}
      className="block px-2 py-2 text-lg font-medium transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
};

// Groupe pour le menu mobile
const MobileMenuGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-foreground/70 pl-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

export function NavigationMenuDemo() {
  const t = useTranslations("nav");
  const { articles, isLoading } = useNavbarArticles();
  const { formattedCount, loading } = useWaitlistCount();
  const locale = useLocale();
  const withLocale = (href: string) =>
    href.startsWith("/") ? `/${locale}${href === "/" ? "" : href}` : href;

  return (
    <>
      {/* Menu Mobile */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background"
              aria-label={t("toggleMenu")}
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[80vw] sm:w-[350px] pt-10 overflow-y-auto"
          >
            <div className="flex flex-col space-y-4 pt-5 pb-8">
              {/* Features Group */}
              <MobileMenuGroup title={t("features")}>
                <MobileMenuItem href="/social-network">
                  {t("socialNetwork")}
                </MobileMenuItem>
                <MobileMenuItem href="/community">
                  {t("community")}
                </MobileMenuItem>
                <MobileMenuItem href="/dataroom">
                  {t("dataroomShort")}
                </MobileMenuItem>
                {/* Not a link, matching the desktop menu: the feature is
                    announced, there is no page behind it yet. */}
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className="block text-lg font-medium text-muted-foreground">
                    {t("methodology")}
                  </span>
                  <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0 h-4">
                    {t("comingSoon")}
                  </Badge>
                </div>
              </MobileMenuGroup>

              {/* Company Group */}
              <MobileMenuGroup title={t("company")}>
                <MobileMenuItem href="/about">{t("ourStory")}</MobileMenuItem>
                <MobileMenuItem href="/careers">{t("joinTeam")}</MobileMenuItem>
                <MobileMenuItem href="/changelog">
                  {t("productUpdates")}
                </MobileMenuItem>
              </MobileMenuGroup>

              {/* Resources Group */}
              <MobileMenuGroup title={t("resources")}>
                <MobileMenuItem href="/blog">{t("blog")}</MobileMenuItem>
              </MobileMenuGroup>

              {/* Pricing */}
              <MobileMenuGroup title={t("pricing")}>
                <MobileMenuItem href="/pricing">{t("pricing")}</MobileMenuItem>
              </MobileMenuGroup>

              {/* Support Group */}
              <MobileMenuGroup title={t("support")}>
                <MobileMenuItem href="/contact">
                  {t("contactUs")}
                </MobileMenuItem>
                <MobileMenuItem href="/report-bug">
                  {t("reportBug")}
                </MobileMenuItem>
                <MobileMenuItem href="/feedback">
                  {t("feedback")}
                </MobileMenuItem>
              </MobileMenuGroup>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Menu Desktop */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("features")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 md:w-[400px] lg:w-[700px]">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold tracking-wide text-[#5E6AD2] mb-0 pb-2 border-b border-gray-100">
                      {t("platformFeatures")}
                    </h4>

                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Featured Section - Left Side */}
                      <div className="lg:w-[40%]">
                        <NavigationMenuLink asChild>
                          <Link
                            href={withLocale("/")}
                            className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full"
                          >
                            <div className="relative h-[220px] lg:h-[260px] w-full">
                              <Image
                                src="/illustrations/stationf.webp"
                                alt="Onefive"
                                fill
                                sizes="280px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity" />

                              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-3">
                                  {t("onefivePlatform")}
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                  {t("growStartup")}
                                </h3>
                                <p className="text-sm text-white/80">
                                  {t("connectWithFounders")}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>

                      {/* First 4 Features - Right Side */}
                      <div className="lg:w-[60%]">
                        <div className="flex flex-col">
                          {/* Feature 1 */}
                          <Link
                            href={withLocale("/social-network")}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium mb-1 group-hover:text-[#5E6AD2] transition-colors">
                                {t("socialNetwork")}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {t("networkWithMentors")}
                              </p>
                            </div>
                          </Link>

                          {/* Feature 2 */}
                          <Link
                            href={withLocale("/community")}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium mb-1 group-hover:text-[#9E77ED] transition-colors">
                                {t("community")}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {t("showcaseStartup")}
                              </p>
                            </div>
                          </Link>

                          <Link
                            href={withLocale("/dataroom")}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium mb-1 group-hover:text-indigo-600 transition-colors">
                                {t("dataroom")}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {t("securelyStore")}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Additional Features Below */}
                    <div className="flex w-full gap-6">
                      {/* Dataroom Feature */}
                      {/* Methodology - Coming Soon */}
                      <div className="w-[40%] group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium mb-1 group-hover:text-green-600 transition-colors">
                              {t("methodology")}
                            </h3>
                            <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0 h-4">
                              {t("comingSoon")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {t("accessStartupGuides")}
                          </p>
                        </div>
                      </div>

                      {/* Investment - Coming Soon */}
                      <div className="w-[60%] group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium mb-1 group-hover:text-teal-600 transition-colors">
                              {t("investment")}
                            </h3>
                            <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0 h-4">
                              {t("comingSoon")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {t("findInvestors")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("company")}</NavigationMenuTrigger>
              <NavigationMenuContent className="p-6 md:w-[400px] lg:w-[700px]">
                <div className="grid lg:grid-cols-[1fr_1.25fr] gap-8">
                  {/* Section principale - About Company */}
                  <div>
                    <h4 className="text-sm font-semibold tracking-wide text-[#5E6AD2] mb-4 pb-2 border-b border-gray-100">
                      {t("aboutOnefive")}
                    </h4>
                    <ul className="grid gap-3.5">
                      <ListItem href="/about" title={t("ourStory")}>
                        {t("learnMoreAboutMission")}
                      </ListItem>
                      <ListItem href="/careers" title={t("joinTeam")}>
                        {t("joinTeamAndShape")}
                      </ListItem>
                      <ListItem href="/changelog" title={t("productUpdates")}>
                        {t("latestUpdates")}
                      </ListItem>
                    </ul>
                  </div>

                  {/* Section Social Media */}
                  <div>
                    <h4 className="text-sm font-semibold tracking-wide text-[#5E6AD2] mb-4 pb-2 border-b border-gray-100">
                      {t("connectWithUs")}
                    </h4>
                    <div className="grid grid-cols-2">
                      <SocialLink
                        icon="/footer/linkedin_footer.svg"
                        platform="LinkedIn"
                        handle="@onefive-social-network"
                        href="https://www.linkedin.com/company/onefive-social-network"
                        color="#0077B5"
                      />
                      <SocialLink
                        icon="/footer/x_footer.svg"
                        platform="X (Twitter)"
                        handle="@onefivenetwork"
                        href="https://x.com/onefivenetwork"
                        color="#000000"
                      />
                      <SocialLink
                        icon="/footer/instagram_footer.svg"
                        platform="Instagram"
                        handle="@onefive"
                        href="https://instagram.com/onefive"
                        color="#E1306C"
                      />
                      <SocialLink
                        icon="/footer/tiktok_footer.svg"
                        platform="TikTok"
                        handle="@onefive"
                        href="https://tiktok.com/@onefive"
                        color="#000000"
                      />
                      <SocialLink
                        icon="/footer/facebook_footer.svg"
                        platform="Facebook"
                        handle="@onefive"
                        href="https://facebook.com/onefive"
                        color="#1877F2"
                      />
                      <SocialLink
                        icon="/footer/youtube_footer.svg"
                        platform="YouTube"
                        handle="@onefivenetwork"
                        href="https://www.youtube.com/@onefivenetwork"
                        color="#FF0000"
                      />
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("resources")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[800px] p-8">
                  {/* Featured Resource - Design amélioré */}

                  {/* Blog Articles - Format exact comme la maquette */}
                  <div className="p-4">
                    {/* En-tête du Blog avec stats */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide text-[#5E6AD2] mb-2">
                          BLOG
                        </h4>
                      </div>
                      <Link
                        href={withLocale("/blog")}
                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#5E6AD2] hover:bg-[#5E6AD2]/5 transition-all duration-200"
                      >
                        {t("seeAllArticles")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Grille d'articles */}
                    <div className="grid gap-4">
                      {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {t("loading")}
                        </div>
                      ) : (
                        articles.map((article) => (
                          <Link
                            key={article.id}
                            href={withLocale(`/blog/${article.slug}`)}
                            className="group flex gap-3 hover:bg-accent/50 p-2 rounded-md"
                          >
                            <div className="relative w-[200px] h-[100px] rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  article.featuredImage.sizes?.navbar?.url ||
                                  (article.featuredImage.sizes?.navbar?.filename &&
                                    `${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.sizes.navbar.filename}`) ||
                                  `${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`
                                }
                                alt={article.featuredImage.alt || article.title}
                                fill
                                sizes="200px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {article.readTime && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm">
                                    {article.readTime}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0"
                                  style={{ color: article.category?.color }}
                                >
                                  {article.category?.name || "Article"}
                                </Badge>
                              </div>
                              <h3 className="text-sm font-medium group-hover:text-[#5E6AD2] transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {article.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {article.author?.image && (
                                    <div className="relative w-4 h-4 rounded-full overflow-hidden">
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.author.image.filename}`}
                                        alt={article.author.name}
                                        fill
                                        sizes="16px"
                                        className="object-cover"
                                        unoptimized
                                        decoding="async"
                                      />
                                    </div>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {article.author?.name}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    article.publishedAt
                                  ).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    {/* Bouton "Proposer une idée d'article" amélioré */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4 bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3 relative">
                            <Avatar className="border-2 border-white relative z-30">
                              <AvatarImage
                                src="https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80"
                                alt="Amelie Laurent"
                              />
                              <AvatarFallback>AL</AvatarFallback>
                            </Avatar>
                            <Avatar className="border-2 border-white relative z-20">
                              <AvatarImage
                                src="https://www.untitledui.com/images/avatars/sally-mason?fm=webp&q=80"
                                alt="Sally Mason"
                              />
                              <AvatarFallback>SM</AvatarFallback>
                            </Avatar>
                            <Avatar className="border-2 border-white relative z-10">
                              <AvatarImage
                                src="https://www.untitledui.com/images/avatars/jordan-burgess?fm=webp&q=80"
                                alt="John Doe"
                              />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {t("shareYourExpertise")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("joinOur")}
                            </span>
                          </div>
                        </div>
                        <Link href={withLocale("/suggest-article")}>
                          <Button
                            variant="default"
                            className="bg-[#5E6AD2] hover:bg-[#4F58B0] text-white whitespace-nowrap"
                          >
                            {t("proposeArticle")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("pricing")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex flex-col items-center justify-center md:w-[400px] lg:w-[700px] h-[260px] gap-4">
                  <Badge className="bg-gradient-to-r px-4 py-2 rounded-full bg-transparent border border-gray-300 text-gray-700">
                    {t("free")}
                  </Badge>
                  <div className="text-sm font-medium leading-none">
                    {t("onefiveIsFree")} 🚀
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground text-center lg:px-0 px-4">
                    {t("takeAdvantage")}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{t("join", { count: formattedCount ?? "..." })}</span>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("support")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[700px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/contact" title={t("contactUs")}>
                    {t("personalizedAssistance")}
                  </ListItem>
                  <ListItem href="/report-bug" title={t("reportBug")}>
                    {t("foundSomething")}
                  </ListItem>
                  <ListItem href="/feedback" title={t("feedback")}>
                    {t("yourOpinion")}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
}

ListItem.displayName = "ListItem";
