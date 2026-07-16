import { Button } from "./ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Input } from "./ui/input";
import { ArrowRight, Shield, Check } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const Footer = ({ className }: { className?: string }) => {
  const t = useTranslations("footer");
  const { formattedCount, loading } = useWaitlistCount();
  // États du formulaire
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Schéma de validation avec Zod
  const emailSchema = z.string().email("Please enter a valid email address");

  // Gestionnaire de changement d'email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Réinitialiser l'erreur lors de la saisie
  };

  // Gestionnaire de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider l'email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      // Appel à l'API
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("failedToSubscribe"));
      }

      posthog.capture("newsletter_signup_success");
      setIsSuccess(true);

      // Réinitialiser le formulaire après 5 secondes
      setTimeout(() => {
        setIsSuccess(false);
        setEmail("");
      }, 5000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setError(t("failedToSubscribe"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      href: "https://x.com/@onefivenetwork",
      icon: "/footer/x_footer.svg",
      alt: "X"
    },
    {
      href: "https://www.linkedin.com/company/onefive-social-network-fr",
      icon: "/footer/linkedin_footer.svg",
      alt: "LinkedIn"
    },
    {
      href: "https://www.facebook.com/onefiveapp",
      icon: "/footer/facebook_footer.svg",
      alt: "Facebook"
    },
    {
      href: "https://www.instagram.com/one_five_app/",
      icon: "/footer/instagram_footer.svg",
      alt: "Instagram"
    },
    {
      href: "https://www.tiktok.com/@onefive.five",
      icon: "/footer/tiktok_footer.svg",
      alt: "Tiktok"
    },
    {
      href: "https://www.youtube.com/@onefivenetwork",
      icon: "/footer/youtube_footer.svg",
      alt: "Youtube"
    }
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center w-full ${className}`}
    >
      {/* Newsletter Section */}
      <div className="flex w-full bg-[#F9FAFB] max-w-7xl mx-auto rounded-2xl overflow-hidden">
        <div className="flex w-full flex-col md:flex-row justify-between items-center p-6 md:p-14 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/patterns/grid.svg"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 relative mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="text-[#101828] text-xl md:text-2xl font-semibold leading-[30px]">
                {t("stayInTheLoop")}
              </div>
              <span className="animate-bounce">🚀</span>
            </div>
            <div className="text-[#475467] text-sm md:text-base font-normal leading-6 max-w-md">
              {t("getWeeklyInsightsOnEntrepreneurshipTechAndInnovation", {
                count: loading ? "..." : formattedCount,
              })}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#667085] justify-center md:justify-start">
              <Shield className="w-4 h-4" />
              {t("weRespectYourPrivacy")}
            </div>
          </div>

          {/* Form */}
          <div className="relative z-10 w-full md:w-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder={t("enterYourEmail")}
                  className="w-full md:min-w-[350px] px-4 py-3 rounded-lg border border-gray-300 text-base 
                    focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] focus:border-transparent h-[48px]
                    pr-[130px] placeholder:text-gray-500"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting || isSuccess}
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1 h-[40px] bg-[#5E6AD2] hover:bg-[#5E6AD2]/90 
                    text-white flex items-center gap-2 px-5 rounded-md transition-all
                    hover:shadow-lg hover:-translate-y-[1px]"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? t("subscribing") : t("subscribe")}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex items-center gap-2 text-xs text-[#667085] justify-center md:justify-start">
                <span>🎉</span>
                <span>{t("promisNoSpamOnlyQualityContent")}</span>
              </div>
            </form>
          </div>

          {/* Success State - Conditionally visible */}
          <div
            className={`absolute inset-0 bg-white/95 flex items-center justify-center ${isSuccess ? "flex" : "hidden"}`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">{t("thanksForSubscribing")}</h3>
              <p className="text-[#475467]">
                {t("checkYourEmailToConfirmYourSubscription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="flex w-full max-w-7xl pt-14 px-6 md:p-14">
        <div className="flex w-full flex-col md:flex-row gap-10 md:gap-16">
          {/* Footer left */}
          <div className="flex flex-col gap-8 items-center md:items-start">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image src="/onefive.svg" alt="Onefive" width={32} height={32} />
            </Link>
            <div className="text-sm text-[#344054] font-medium leading-5 w-full md:w-[320px] text-center md:text-left">
              {t("joinUsAndEnjoyTheEcosystemAndOpportunities")}
            </div>
            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.alt}
                  href={link.href}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  rel="noopener noreferrer nofollow"
                  aria-label={`${t("follow")} ${link.alt}`}
                  target="_blank"
                >
                  <Image
                    src={link.icon}
                    alt={link.alt}
                    width={20}
                    height={20}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Footer right - Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 flex-1 w-full text-center md:text-left">
            {/* Company */}
            <div className="flex flex-col gap-4 items-center md:items-start">
              <div className="text-[#667085] text-sm font-semibold leading-5">
                {t("company")}
              </div>
              <div className="flex flex-col gap-3 items-center md:items-start">
                {/* Paths are explicit, not derived from the translation key:
                    `"mediaKit".toLowerCase()` produced /mediakit — a 404 in the
                    footer, so on every page of the site — and the space that
                    .replace() looked for never existed. */}
                {[
                  { key: "about", href: "/about" },
                  { key: "careers", href: "/careers" },
                  { key: "contact", href: "/contact" },
                ].map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    className="text-[#475467] text-base font-semibold leading-6 hover:text-[#5E6AD2] transition-colors"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4 items-center md:items-start">
              <div className="text-[#667085] text-sm font-semibold leading-5">
                {t("legal")}
              </div>
              <div className="flex flex-col gap-3 items-center md:items-start">
                <Link
                  href="/terms"
                  className="text-[#475467] text-base font-semibold leading-6 hover:text-[#5E6AD2] transition-colors"
                >
                  {t("terms")}
                </Link>
                <Link
                  href="/privacy"
                  className="text-[#475467] text-base font-semibold leading-6 hover:text-[#5E6AD2] transition-colors"
                >
                  {t("privacy")}
                </Link>
                <Link
                  href="/cookies"
                  className="text-[#475467] text-base font-semibold leading-6 hover:text-[#5E6AD2] transition-colors"
                >
                  {t("cookies")}
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4 items-center md:items-start">
              <div className="text-[#667085] text-sm font-semibold leading-5">
                {t("resources")}
              </div>
              <div className="flex flex-col gap-3 items-center md:items-start">
                <Link
                  href="/blog"
                  className="text-[#475467] text-base font-semibold leading-6 hover:text-[#5E6AD2] transition-colors"
                >
                  {t("blog")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex w-full max-w-7xl py-8 mt-14 border-t px-6 md:p-14">
        <div className="flex w-full flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="text-[#667085] text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} {t("allRightsReserved")}
          </div>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-[#667085] hover:text-[#5E6AD2] text-sm font-medium transition-colors"
            >
              {t("terms")}
            </Link>
            <Link
              href="/privacy"
              className="text-[#667085] hover:text-[#5E6AD2] text-sm font-medium transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/cookies"
              className="text-[#667085] hover:text-[#5E6AD2] text-sm font-medium transition-colors"
            >
              {t("cookies")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
