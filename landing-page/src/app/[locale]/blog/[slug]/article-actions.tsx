"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

// Client island for the two interactive bits of an article: incrementing the
// view counter (once per session) and the share button.
export default function ArticleActions({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(`viewed-${slug}`)) return;
    fetch(`/api/blog/${slug}/views`, { method: "POST" }).catch(() => {});
    sessionStorage.setItem(`viewed-${slug}`, "true");
  }, [slug]);

  const handleShare = async () => {
    const shareData = { title, text: description, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error("Erreur lors du partage:", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Partager
    </Button>
  );
}
