"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { getArticles } from "@/utils/blog-api";

export type NavbarArticle = {
  id: string | number;
  title: string;
  description: string;
  slug: string;
  category?: {
    name: string;
    color?: string;
  };
  featuredImage: {
    filename: string;
    alt?: string;
    sizes?: {
      navbar?: {
        url?: string;
        filename?: string;
      };
    };
  };
  author?: {
    name: string;
    image?: {
      filename: string;
    };
  };
  publishedAt: string;
  readTime?: string;
};

type NavbarArticlesValue = {
  articles: NavbarArticle[];
  isLoading: boolean;
};

const NavbarArticlesContext = createContext<NavbarArticlesValue | null>(null);

export function NavbarArticlesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const [articles, setArticles] = useState<NavbarArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getArticles({ limit: 6, navbar: true, locale })
      .then((res) => {
        if (!cancelled && res?.docs) {
          setArticles(Array.isArray(res.docs) ? res.docs : []);
        }
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const value: NavbarArticlesValue = {
    articles,
    isLoading,
  };

  return (
    <NavbarArticlesContext.Provider value={value}>
      {children}
    </NavbarArticlesContext.Provider>
  );
}

export function useNavbarArticles(): NavbarArticlesValue {
  const ctx = useContext(NavbarArticlesContext);
  if (ctx == null) {
    throw new Error(
      "useNavbarArticles must be used within a NavbarArticlesProvider"
    );
  }
  return ctx;
}
