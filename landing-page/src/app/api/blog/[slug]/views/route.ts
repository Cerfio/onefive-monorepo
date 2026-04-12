import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`Incrementing views for: ${slug}`);

    // 1. Récupérer l'article par son slug
    const findResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/articles?where[slug][equals]=${encodeURIComponent(slug)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
      }
    );

    if (!findResponse.ok) {
      console.error("Failed to find article", await findResponse.text());
      throw new Error("Failed to find article");
    }

    const data = await findResponse.json();
    console.log("Article search result:", data);

    if (!data.docs || data.docs.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const article = data.docs[0];
    const currentViews = article.views || 0;
    const newViews = currentViews + 1;

    console.log(`Updating views from ${currentViews} to ${newViews}`);

    // 2. Incrémenter le compteur de vues
    const updateResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/articles/${article.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
          views: newViews,
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error("Failed to update view count", await updateResponse.text());
      throw new Error("Failed to update view count");
    }

    const updatedData = await updateResponse.json();
    console.log("Update response:", updatedData);

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
