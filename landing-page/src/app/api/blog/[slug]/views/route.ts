import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const payload = await getPayloadClient();

    // 1. Récupérer l'article par son slug
    const data = await payload.find({
      collection: "articles",
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
      },
      limit: 1,
      depth: 0,
    });

    if (!data.docs || data.docs.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const article = data.docs[0];
    const currentViews = (article as { views?: number }).views || 0;
    const newViews = currentViews + 1;

    // 2. Incrémenter le compteur de vues
    await payload.update({
      collection: "articles",
      id: article.id,
      data: { views: newViews } as never,
    });

    return NextResponse.json({
      success: true,
      previousViews: currentViews,
      newViews: newViews,
    });
  } catch (error) {
    console.error("Error incrementing article views:", error);
    return NextResponse.json(
      {
        error: "Failed to increment article views",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
