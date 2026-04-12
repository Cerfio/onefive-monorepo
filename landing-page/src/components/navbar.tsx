"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ButtonJoinWaitlist from "./ui/button-join-wailist";
import { NavigationMenuDemo } from "./navigation-menu-demo";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  hasScrolled: boolean;
}

// Mise à jour du type pour les langues
type Language = "fr" | "en";

export function Navbar({ hasScrolled }: NavbarProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Language;
  const [currentLang, setCurrentLang] = useState<Language>(currentLocale);

  useEffect(() => {
    setCurrentLang(currentLocale);
  }, [currentLocale]);

  // Fonction pour déterminer le drapeau à afficher dans le bouton principal
  const getCurrentFlag = () => {
    switch (currentLang) {
      case "fr":
        return "🇫🇷";
      case "en":
        return "🇺🇸 🇬🇧";
      default:
        return "🇺🇸 🇬🇧";
    }
  };

  // Adapter la fonction switchLanguage si nécessaire
  const switchLanguage = (newLanguage: Language) => {
    if (newLanguage === currentLang) return;

    setCurrentLang(newLanguage);
    const pathSegments = pathname.split("/");

    // Adapter pour les chemins d'URL (utiliser 'en' pour les deux variantes d'anglais si nécessaire)
    pathSegments[1] = newLanguage.startsWith("en") ? "en" : newLanguage;
    router.push(pathSegments.join("/"));
  };

  return (
    <motion.div
      className={cn(
        "flex justify-between sticky bg-background/75 backdrop-blur-[10px] rounded-2xl transition-all duration-300",
        "py-4 px-4 mx-auto max-w-screen-xl gap-4",
        hasScrolled
          ? "border-[1px] border-border"
          : "border-[0px] border-transparent",
        "z-50"
      )}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        top: hasScrolled ? "16px" : "32px",
        width: hasScrolled ? "70%" : "100%",
      }}
      transition={{ duration: 0.2 }}
    >
      <Link href="/" className="flex items-center gap-2 relative w-[120px]">
        <Image
          src="/onefive.svg"
          alt="Onefive"
          width={32}
          height={32}
          className="z-10"
        />
        <motion.span
          className={cn("transition-all duration-200 absolute left-12 z-20")}
          animate={{
            opacity: hasScrolled ? 0 : 1,
            x: hasScrolled ? -20 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          Onefive
        </motion.span>
      </Link>
      <NavigationMenuDemo />
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 p-0"
            >
              <span className="text-base">{getCurrentFlag()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem
              onClick={() => switchLanguage("fr")}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                currentLang === "fr" ? "bg-muted" : ""
              )}
            >
              <span className="text-base">🇫🇷</span> Français
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLanguage("en")}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                currentLang === "en" ? "bg-muted" : ""
              )}
            >
              <span className="text-base">🇺🇸 🇬🇧</span> English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <ButtonJoinWaitlist text={t("joinWaitlist")} />
        </div>
        {/* <ThemeToggle /> */}
      </div>
    </motion.div>
  );
}
