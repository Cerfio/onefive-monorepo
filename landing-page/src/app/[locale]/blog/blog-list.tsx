"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, Eye, Filter, ArrowRight } from "lucide-react";
import { getArticles } from "@/utils/blog-api";
import Article from "@/types/article.interface";

const ITEMS_PER_PAGE = 12;

export default function BlogList({
  initialArticles,
  initialTotalDocs,
  categories,
  locale,
}: {
  initialArticles: Article[];
  initialTotalDocs: number;
  categories: string[];
  locale: string;
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(initialTotalDocs / ITEMS_PER_PAGE))
  );
  // The first page/category is already server-rendered — don't re-fetch on
  // mount (it would clobber the SSR list). Only fetch on later interactions.
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const loadBlogData = async () => {
      try {
        setIsLoading(true);
        const filter =
          selectedCategory !== "All" ? { category: selectedCategory } : {};

        const articlesResponse = await getArticles({
          ...filter,
          limit: ITEMS_PER_PAGE,
          page: currentPage,
          locale,
        });

        if (articlesResponse.docs && Array.isArray(articlesResponse.docs)) {
          setArticles(articlesResponse.docs);
          setTotalPages(
            Math.max(1, Math.ceil(articlesResponse.totalDocs / ITEMS_PER_PAGE))
          );
          setError(null);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error("Error loading blog data:", err);
        setError("Failed to load blog content. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogData();
  }, [selectedCategory, currentPage, locale]);

  const filteredArticles = articles.filter((article) =>
    searchQuery
      ? article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              className={`w-10 h-10 ${
                currentPage === page ? "bg-[#5E6AD2]" : ""
              }`}
              onClick={() => handlePageChange(Number(page))}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 mt-16">
      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search articles..."
              className="pl-10 border-gray-200 bg-gray-50/70 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 w-full md:w-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`${
                  selectedCategory === category
                    ? "bg-[#5E6AD2] text-white shadow-sm"
                    : "hover:bg-[#5E6AD2]/10 border-gray-200"
                } whitespace-nowrap font-medium`}
                size="sm"
              >
                {category}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 text-gray-500 hover:bg-gray-100"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Liste d'articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(9)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex flex-col rounded-xl border bg-white shadow-sm animate-pulse h-full"
              >
                <div className="h-56 bg-gray-200 rounded-t-xl shrink-0"></div>
                <div className="flex flex-col grow p-5">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-6 grow"></div>
                </div>
              </div>
            ))
        ) : error ? (
          <div className="col-span-full text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aucun article ne correspond à votre recherche."
                : "Aucun article trouvé pour cette catégorie."}
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Link
              key={article.id || article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-xl overflow-hidden border hover:border-[#5E6AD2] hover:shadow-lg transition-all duration-300 bg-white h-full"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                {article.featuredImage?.filename && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`}
                    alt={article.title || "Blog article"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <Badge className="absolute top-3 left-3 bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 font-medium">
                  {article.category?.name || "Article"}
                </Badge>
              </div>

              <div className="flex flex-col flex-grow p-5">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-2">
                  {article.title || "Untitled Article"}
                </h3>
                <p className="text-muted-foreground mb-5 line-clamp-2 text-sm flex-grow">
                  {article.description || "No description available"}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5E6AD2]" />
                        <span>
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString(
                                "fr-FR",
                                { year: "numeric", month: "short", day: "numeric" }
                              )
                            : "Date inconnue"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#5E6AD2]" />
                        <span>{article.readTime || "5 min"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#5E6AD2]" />
                      <span>{article.views ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {article.author?.image?.filename ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.author.image.filename}`}
                          alt={article.author.name || "Author"}
                          width={30}
                          height={30}
                          className="rounded-full border border-gray-200"
                        />
                      ) : (
                        <div className="w-[30px] h-[30px] rounded-full bg-gray-300"></div>
                      )}
                      <span className="text-sm font-medium">
                        {article.author?.name || "Onefive"}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5E6AD2] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {!isLoading &&
        !error &&
        filteredArticles.length > 0 &&
        totalPages > 1 &&
        renderPagination()}
    </div>
  );
}
