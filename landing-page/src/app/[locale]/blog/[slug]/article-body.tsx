import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, ArrowLeft } from "lucide-react";
import LexicalRenderer from "@/components/LexicalRenderer";
import Article from "@/types/article.interface";
import ArticleActions from "./article-actions";

// Server Component: everything here is rendered into the initial HTML. Only the
// share button + view-increment live in the <ArticleActions> client island.
export default function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 mt-16">
      {/* Retour + partage */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour aux articles
          </Button>
        </Link>
        <ArticleActions
          slug={article.slug}
          title={article.title}
          description={article.description}
        />
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-[#5E6AD2]/10 text-[#5E6AD2] border-0 font-medium">
            {article.category?.name || "Article"}
          </Badge>
          {article.publishedAt && (
            <div className="text-muted-foreground text-sm flex items-center">
              <Calendar className="inline mr-1 h-3.5 w-3.5" />
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
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
                {article.author?.name || "Onefive"}
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
              <span>{article.views ?? 0} vues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image principale */}
      {article.featuredImage?.filename && (
        <div className="relative h-96 mb-10 rounded-xl overflow-hidden">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="prose prose-lg max-w-none">
        <LexicalRenderer content={article.content as never} />
      </div>

      {/* Tags */}
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
