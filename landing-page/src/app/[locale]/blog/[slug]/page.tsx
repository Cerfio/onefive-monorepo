"use client";

import React, { useEffect, useState } from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, ArrowLeft, Share2 } from "lucide-react";
import { getArticleBySlug } from "@/utils/blog-api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LexicalRenderer from "@/components/LexicalRenderer";
import Article from "@/types/article.interface";
import Builder from "@/components/builder";

function Body({
  setArticleData,
}: {
  setArticleData: (data: {
    title: string;
    description: string;
    badge: string;
  }) => void;
}) {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || "fr";

  useEffect(() => {
    const incrementViews = async () => {
      try {
        await fetch(`/api/blog/${slug}/views`, {
          method: "POST",
        });

        // Recharger l'article après l'incrémentation pour obtenir le nombre de vues mis à jour
        const refreshedArticle = await getArticleBySlug(slug, locale);
        setArticle(refreshedArticle);
      } catch (err) {
        console.error("Error incrementing views:", err);
      }
    };

    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const articleData = await getArticleBySlug(slug, locale);
        setArticle(articleData);
        // Remonter les informations de l'article avec la catégorie
        setArticleData({
          title: articleData.title,
          description:
            articleData.description || "Read our latest articles and news",
          badge: articleData.category?.name || "Blog",
        });

        // Incrémenter les vues une fois l'article chargé
        // Mais seulement si l'article n'a pas déjà été vu dans cette session
        if (!sessionStorage.getItem(`viewed-${slug}`)) {
          await incrementViews();
          sessionStorage.setItem(`viewed-${slug}`, "true");
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Failed to load article. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug, setArticleData]);

  if (isLoading) {
    return (
      <div className="bg-[#FCFCFD] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {error || "Article not found"}
        </h1>
        <Button onClick={() => router.push("/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 mt-16">
      {/* Bouton retour et partage */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour aux articles
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={async () => {
            const shareData = {
              title: article.title,
              text: article.description,
              url: window.location.href
            };

            try {
              if (navigator.share) {
                await navigator.share(shareData);
              } else {
                await navigator.clipboard.writeText(window.location.href);
                // Vous pouvez ajouter une notification ici pour informer l'utilisateur
              }
            } catch (err) {
              console.error('Erreur lors du partage:', err);
            }
          }}
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>

      {/* En-tête de l'article */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 font-medium">
            {article.category?.name || "Article"}
          </Badge>
          <div className="text-muted-foreground text-sm flex items-center">
            <Calendar className="inline mr-1 h-3.5 w-3.5" />
            {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-6">{article.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {article.author?.image?.filename ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.author.image.filename}`}
                alt={article.author.name || "Author"}
                width={40}
                height={40}
                className="rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            )}
            <div>
              <div className="font-medium">
                {article.author?.name || "Anonymous"}
              </div>
              <div className="text-sm text-muted-foreground">
                {article.author?.role || ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-[#5E6AD2]" />
              <span>{article.readTime || "5 min"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-[#5E6AD2]" />
              <span>{article.views || "0"} vues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image principale */}
      <div className="relative h-96 mb-10 rounded-xl overflow-hidden">
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenu de l'article */}
      <div className="prose prose-lg max-w-none">
        <LexicalRenderer content={article.content} />
      </div>

      {/* Tags de l'article */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t">
          <h3 className="text-lg font-medium mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="px-3 py-1">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogArticlePage() {
  const [articleData, setArticleData] = useState({
    title: "Blog",
    description: "Read our latest articles and news",
    badge: "...",
  });

  return (
    <Builder
      title={null}
      description={null}
      image={null}
      body={<Body setArticleData={setArticleData} />}
      displayJoinWaitlist={false}
      badge={articleData.badge}
    />
  );
}
