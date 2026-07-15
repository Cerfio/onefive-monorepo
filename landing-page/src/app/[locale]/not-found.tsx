"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Orbit404 } from "@/components/not-found/orbit-404";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 overflow-x-hidden bg-background px-4 py-16">
      <Orbit404 />

      <motion.div
        className="flex max-w-md flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.75, ease: "easeOut" }}
      >
        <h1 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-[#101828] dark:text-gray-100 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-balance text-[#475467] dark:text-gray-400">
          {t("description")}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}`}
            className="rounded-lg bg-[#101828] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#344054] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101828] dark:bg-gray-100 dark:text-[#101828] dark:hover:bg-gray-300"
          >
            {t("backHome")}
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101828] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {t("readBlog")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
